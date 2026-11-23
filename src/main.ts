import {
  addRescueJar,
  applyMove,
  canPour,
  createGame,
  deserializeState,
  GameState,
  LevelDefinition,
  Move,
  serializeState,
  undo,
} from './engine';
import { solve } from './solver/solver';
import { sound } from './audio/sound';
import { COLOR_MAP, CUSTOMER_AVATARS } from './skins/theme';
import { StorageService, UserProgress } from './save/storage';
import { ConfettiCannon } from './render/confetti';
import { TRANSLATIONS } from './i18n/translations';

class GameApp {
  private state!: GameState;
  private currentLevelDef!: LevelDefinition;
  private progress: UserProgress;
  private selectedJarId: string | null = null;
  private confetti: ConfettiCannon;
  private lang: 'vi' | 'en' = 'vi';

  // DOM Elements
  private hudLevel = document.getElementById('hud-level')!;
  private hudMoves = document.getElementById('hud-moves')!;
  private ordersContainer = document.getElementById('orders-container')!;
  private boardContainer = document.getElementById('board-container')!;
  private badgeUndo = document.getElementById('badge-undo')!;
  private badgeAddJar = document.getElementById('badge-add-jar')!;

  // Modals
  private modalWin = document.getElementById('modal-win')!;
  private modalStuck = document.getElementById('modal-stuck')!;
  private modalSettings = document.getElementById('modal-settings')!;
  private btnStuckRescue = document.getElementById('btn-stuck-rescue') as HTMLButtonElement;

  constructor() {
    this.progress = StorageService.load();
    this.lang = (this.progress.settings.lang as 'vi' | 'en') || 'vi';
    sound.soundEnabled = this.progress.settings.sound;
    sound.musicEnabled = this.progress.settings.music;

    const confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    this.confetti = new ConfettiCannon(confettiCanvas);

    this.initEvents();
    this.loadLevel(this.progress.currentLevel);

    if (this.progress.settings.music) {
      // Start BGM on first interaction
      window.addEventListener('click', () => sound.startBgm(), { once: true });
    }
  }

  private t() {
    return TRANSLATIONS[this.lang] || TRANSLATIONS['vi'];
  }

  private async fetchLevelDefinition(levelId: number): Promise<LevelDefinition> {
    const filename = `level_${String(levelId).padStart(3, '0')}.json`;
    try {
      const res = await fetch(`/levels/${filename}`);
      if (res.ok) {
        return (await res.json()) as LevelDefinition;
      }
    } catch {
      // Fallback
    }

    // Default procedural fallback if network fetch fails
    return {
      id: levelId,
      jars: [
        { id: 'jar_1', capacity: 4, layers: ['strawberry', 'strawberry', 'blueberry', 'blueberry'] },
        { id: 'jar_2', capacity: 4, layers: ['blueberry', 'blueberry', 'strawberry', 'strawberry'] },
        { id: 'jar_3', capacity: 4, layers: [] },
        { id: 'jar_4', capacity: 4, layers: [] },
      ],
      orders: [
        { id: 'order_1', customerId: 'cat_mochi', color: 'strawberry', count: 1, maxPatienceSeconds: 90 },
        { id: 'order_2', customerId: 'cat_mimi', color: 'blueberry', count: 1, maxPatienceSeconds: 90 },
      ],
      starThresholds: { moves: [10, 16, 25] },
    };
  }

  public async loadLevel(levelId: number) {
    this.selectedJarId = null;
    this.modalWin.style.display = 'none';
    this.modalStuck.style.display = 'none';

    this.currentLevelDef = await this.fetchLevelDefinition(levelId);

    // Check if there is mid-level saved state
    if (this.progress.midLevelState && this.progress.currentLevel === levelId) {
      try {
        this.state = deserializeState(this.progress.midLevelState);
      } catch {
        this.state = createGame(this.currentLevelDef);
      }
    } else {
      this.state = createGame(this.currentLevelDef);
    }

    this.progress.currentLevel = levelId;
    this.saveProgress();
    this.render();
  }

  private saveProgress() {
    this.progress.midLevelState = serializeState(this.state);
    StorageService.save(this.progress);
  }

  private initEvents() {
    // Toolbar buttons
    document.getElementById('btn-undo')!.addEventListener('click', () => this.handleUndo());
    document.getElementById('btn-add-jar')!.addEventListener('click', () => this.handleAddJar());
    document.getElementById('btn-hint')!.addEventListener('click', () => this.handleHint());
    document.getElementById('btn-restart')!.addEventListener('click', () => this.loadLevel(this.progress.currentLevel));

    // Modals
    document.getElementById('btn-next-level')!.addEventListener('click', () => {
      this.loadLevel(this.progress.currentLevel + 1);
    });

    document.getElementById('btn-stuck-rescue')!.addEventListener('click', () => {
      this.modalStuck.style.display = 'none';
      this.handleAddJar();
    });

    document.getElementById('btn-stuck-undo')!.addEventListener('click', () => {
      this.modalStuck.style.display = 'none';
      this.handleUndo();
    });

    document.getElementById('btn-stuck-restart')!.addEventListener('click', () => {
      this.modalStuck.style.display = 'none';
      this.loadLevel(this.progress.currentLevel);
    });

    // Settings
    document.getElementById('btn-settings')!.addEventListener('click', () => {
      this.modalSettings.style.display = 'flex';
    });

    document.getElementById('btn-close-settings')!.addEventListener('click', () => {
      this.modalSettings.style.display = 'none';
    });

    const chkSound = document.getElementById('setting-sound') as HTMLInputElement;
    const chkMusic = document.getElementById('setting-music') as HTMLInputElement;
    const chkColorblind = document.getElementById('setting-colorblind') as HTMLInputElement;
    const chkHaptic = document.getElementById('setting-haptic') as HTMLInputElement;
    const selLang = document.getElementById('setting-lang') as HTMLSelectElement;

    chkSound.checked = this.progress.settings.sound;
    chkMusic.checked = this.progress.settings.music;
    chkColorblind.checked = this.progress.settings.colorblind;
    chkHaptic.checked = this.progress.settings.haptics;
    selLang.value = this.lang;

    chkSound.addEventListener('change', () => {
      this.progress.settings.sound = chkSound.checked;
      sound.soundEnabled = chkSound.checked;
      this.saveProgress();
    });

    chkMusic.addEventListener('change', () => {
      this.progress.settings.music = chkMusic.checked;
      sound.musicEnabled = chkMusic.checked;
      if (chkMusic.checked) sound.startBgm();
      else sound.stopBgm();
      this.saveProgress();
    });

    chkColorblind.addEventListener('change', () => {
      this.progress.settings.colorblind = chkColorblind.checked;
      this.saveProgress();
      this.render();
    });

    chkHaptic.addEventListener('change', () => {
      this.progress.settings.haptics = chkHaptic.checked;
      this.saveProgress();
    });

    selLang.addEventListener('change', () => {
      this.lang = selLang.value as 'vi' | 'en';
      this.progress.settings.lang = this.lang;
      this.saveProgress();
      this.render();
    });
  }

  private handleJarClick(jarId: string) {
    if (this.state.isWon) return;

    if (!this.selectedJarId) {
      // Pick source jar
      const jar = this.state.jars.find(j => j.id === jarId);
      if (jar && jar.layers.length > 0) {
        this.selectedJarId = jarId;
        sound.play('jar_select');
        this.render();
      }
    } else {
      // Picked target
      if (this.selectedJarId === jarId) {
        // Deselect
        this.selectedJarId = null;
        sound.play('jar_deselect');
        this.render();
      } else {
        // Try pour
        const src = this.state.jars.find(j => j.id === this.selectedJarId)!;
        const tgt = this.state.jars.find(j => j.id === jarId)!;

        if (canPour(src, tgt)) {
          const run = src.layers[src.layers.length - 1];
          const amount = Math.min(
            src.layers.filter(c => c === run).length,
            tgt.capacity - tgt.layers.length
          );

          const move: Move = {
            fromJarId: src.id,
            toJarId: tgt.id,
            count: amount,
            color: run,
          };

          try {
            this.state = applyMove(this.state, move);
            sound.play('pour_start');

            // Check if any packing event occurred
            const lastRecord = this.state.history[this.state.history.length - 1];
            if (lastRecord && lastRecord.packedEvents.length > 0) {
              sound.play('cork_pop');
              sound.play('order_delivered');
            }

            this.selectedJarId = null;
            this.saveProgress();
            this.render();

            if (this.state.isWon) {
              this.handleWin();
            } else if (this.state.isStuck) {
              this.handleStuck();
            }
          } catch (err) {
            console.error('Move failed:', err);
            sound.play('jar_invalid');
            this.selectedJarId = null;
            this.render();
          }
        } else {
          // Invalid target
          sound.play('jar_invalid');
          this.selectedJarId = null;
          this.render();
        }
      }
    }
  }

  private handleUndo() {
    if (this.state.history.length === 0) return;
    this.state = undo(this.state);
    sound.play('tool_undo');
    this.selectedJarId = null;
    this.saveProgress();
    this.render();
  }

  private handleAddJar() {
    this.state = addRescueJar(this.state);
    sound.play('tool_add_jar');
    this.saveProgress();
    this.render();
  }

  private handleHint() {
    const res = solve(this.state, { maxNodes: 10000 });
    if (res.solvable && res.solution.length > 0) {
      const bestMove = res.solution[0];
      sound.play('jar_select');
      this.selectedJarId = bestMove.fromJarId;
      this.render();

      // Highlight target
      const tgtEl = document.querySelector(`[data-jar-id="${bestMove.toJarId}"]`);
      if (tgtEl) {
        tgtEl.classList.add('valid-target');
      }
    }
  }

  private handleWin() {
    sound.play('win_fanfare');
    this.confetti.burst(100);

    // Save star rating
    const moves = this.state.moveCount;
    const thresholds = this.state.starThresholds.moves;
    let stars = 1;
    if (moves <= thresholds[0]) stars = 3;
    else if (moves <= thresholds[1]) stars = 2;

    this.progress.levelStars[Number(this.state.levelId)] = Math.max(
      this.progress.levelStars[Number(this.state.levelId)] || 0,
      stars
    );

    this.progress.highestUnlockedLevel = Math.max(
      this.progress.highestUnlockedLevel,
      Number(this.state.levelId) + 1
    );

    this.saveProgress();

    // Render stars on modal
    const starSpans = this.modalWin.querySelectorAll('.stars-row .star');
    starSpans.forEach((s, idx) => {
      if (idx < stars) s.classList.add('earned');
      else s.classList.remove('earned');
    });

    setTimeout(() => {
      this.modalWin.style.display = 'flex';
    }, 600);
  }

  private handleStuck() {
    sound.play('stuck_gentle');
    this.btnStuckRescue.style.display = this.state.freeRescueAvailable ? 'block' : 'none';
    setTimeout(() => {
      this.modalStuck.style.display = 'flex';
    }, 400);
  }

  private render() {
    const t = this.t();

    // HUD
    this.hudLevel.textContent = t.levelTitle(Number(this.state.levelId));
    this.hudMoves.textContent = t.movesCount(this.state.moveCount);
    this.badgeUndo.textContent = String(this.state.history.length);
    this.badgeAddJar.textContent = this.state.freeRescueAvailable ? 'FREE' : '0';

    // Orders
    this.ordersContainer.innerHTML = '';
    for (const order of this.state.orders) {
      const isDone = order.fulfilledCount >= order.count;
      const theme = COLOR_MAP[order.color] || { name: order.color, hex: '#CCC', symbol: '?' };
      const customer = CUSTOMER_AVATARS[order.customerId] || { name: 'Cat', avatar: '🐱' };

      const card = document.createElement('div');
      card.className = `customer-card ${isDone ? 'completed' : ''}`;
      card.innerHTML = `
        <div class="customer-avatar">${isDone ? '😻' : customer.avatar}</div>
        <div class="order-bubble">
          <span class="order-swatch" style="background-color: ${theme.hex};">
            ${this.progress.settings.colorblind ? `<span class="order-symbol">${theme.symbol}</span>` : ''}
          </span>
          <span>${order.fulfilledCount}/${order.count}</span>
        </div>
      `;
      this.ordersContainer.appendChild(card);
    }

    // Jars Board
    this.boardContainer.innerHTML = '';
    const srcJar = this.selectedJarId ? this.state.jars.find(j => j.id === this.selectedJarId) : null;

    for (const jar of this.state.jars) {
      const isSelected = this.selectedJarId === jar.id;
      const isValidTarget = srcJar ? canPour(srcJar, jar) : false;

      const jarWrapper = document.createElement('div');
      jarWrapper.className = `jar-wrapper ${isSelected ? 'selected' : ''} ${isValidTarget ? 'valid-target' : ''}`;
      jarWrapper.setAttribute('data-jar-id', jar.id);
      jarWrapper.setAttribute('role', 'button');
      jarWrapper.setAttribute('aria-label', `Jar ${jar.id} with ${jar.layers.length} layers`);

      const mouth = document.createElement('div');
      mouth.className = 'jar-mouth';
      jarWrapper.appendChild(mouth);

      const glass = document.createElement('div');
      glass.className = 'jar-glass';

      for (const color of jar.layers) {
        const theme = COLOR_MAP[color] || { name: color, hex: '#999', symbol: '?' };
        const layer = document.createElement('div');
        layer.className = 'liquid-layer';
        layer.style.backgroundColor = theme.hex;

        if (this.progress.settings.colorblind) {
          const mark = document.createElement('span');
          mark.className = 'colorblind-mark';
          mark.textContent = theme.symbol;
          layer.appendChild(mark);
        }

        glass.appendChild(layer);
      }

      jarWrapper.appendChild(glass);
      jarWrapper.addEventListener('click', () => this.handleJarClick(jar.id));
      this.boardContainer.appendChild(jarWrapper);
    }
  }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
