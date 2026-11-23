import {
  applyMove,
  canonicalHash,
  canonicalString,
  createGame,
  legalMoves,
  LevelDefinition,
  Move,
  PackingEvent,
  undo,
} from '../src/engine';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function createPrng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLOR_NAMES = ['strawberry', 'blueberry', 'lemon', 'kiwi', 'grape', 'peach', 'orange', 'mint'];

function createRandomDeterministicLevel(seed: number, prng: () => number, id: number): LevelDefinition {
  const numColors = 3 + Math.floor(prng() * 3);
  const colors = COLOR_NAMES.slice(0, numColors);
  const capacity = 4;

  const allUnits: string[] = colors.flatMap(c => Array(capacity).fill(c));
  for (let i = allUnits.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [allUnits[i], allUnits[j]] = [allUnits[j], allUnits[i]];
  }

  const jars = colors.map((_, idx) => ({
    id: `jar_${idx + 1}`,
    capacity,
    layers: allUnits.slice(idx * capacity, (idx + 1) * capacity),
  }));

  // 2 empty jars
  jars.push({ id: `jar_${colors.length + 1}`, capacity, layers: [] });
  jars.push({ id: `jar_${colors.length + 2}`, capacity, layers: [] });

  const orders = colors.map((c, idx) => ({
    id: `order_${idx + 1}`,
    customerId: `cat_${idx + 1}`,
    color: c,
    count: 1,
    maxPatienceSeconds: 60,
  }));

  return {
    id,
    seed,
    jars,
    orders,
    starThresholds: { moves: [15, 25, 35] },
  };
}

export interface GoldenCase {
  caseId: number;
  initialCanonicalString: string;
  initialHash: string;
  legalMoves: Move[];
  move: Move;
  nextCanonicalString: string;
  nextHash: string;
  events: PackingEvent[];
  isWon: boolean;
  isStuck: boolean;
  undoHash: string;
  undoMatchesInitial: boolean;
}

export interface GoldenLevelReplay {
  levelId: number;
  minMoves: number;
  stepHashes: string[];
  finalWon: boolean;
}

export interface GoldenDataset {
  version: string;
  seed: number;
  totalCases: number;
  cases: GoldenCase[];
  levelReplays: GoldenLevelReplay[];
}

export function exportGoldenDataset(targetPath: string, totalCases: number = 5000): {
  filePath: string;
  sha256: string;
  totalCases: number;
  totalReplays: number;
} {
  const seed = 20261123;
  const prng = createPrng(seed);

  const cases: GoldenCase[] = [];
  let caseId = 0;
  let levelCounter = 1;

  while (cases.length < totalCases) {
    const level = createRandomDeterministicLevel(seed + levelCounter, prng, levelCounter);
    levelCounter++;
    let state = createGame(level);

    for (let step = 0; step < 25 && cases.length < totalCases; step++) {
      if (state.isWon) break;

      const moves = legalMoves(state);
      if (moves.length === 0) break;

      // Deterministic choice from sorted legalMoves
      const moveIndex = Math.floor(prng() * moves.length);
      const chosenMove = moves[moveIndex];

      const initialCanonical = canonicalString(state);
      const initialHash = canonicalHash(state);

      const nextState = applyMove(state, chosenMove);
      const nextCanonical = canonicalString(nextState);
      const nextHash = canonicalHash(nextState);

      const lastRecord = nextState.history[nextState.history.length - 1];
      const events = lastRecord ? lastRecord.packedEvents : [];

      const stateAfterUndo = undo(nextState);
      const undoHash = canonicalHash(stateAfterUndo);

      caseId++;
      cases.push({
        caseId,
        initialCanonicalString: initialCanonical,
        initialHash,
        legalMoves: moves,
        move: chosenMove,
        nextCanonicalString: nextCanonical,
        nextHash,
        events,
        isWon: nextState.isWon,
        isStuck: nextState.isStuck,
        undoHash,
        undoMatchesInitial: undoHash === initialHash,
      });

      state = nextState;
    }
  }

  // 120 Levels replay certification
  const levelsDir = path.resolve(import.meta.dirname, '../shared/levels');
  const levelReplays: GoldenLevelReplay[] = [];

  for (let id = 1; id <= 120; id++) {
    const filename = `level_${String(id).padStart(3, '0')}.json`;
    const level: LevelDefinition = JSON.parse(fs.readFileSync(path.join(levelsDir, filename), 'utf-8'));

    let st = createGame(level);
    const stepHashes: string[] = [canonicalHash(st)];

    for (const m of level.solution!) {
      st = applyMove(st, m);
      stepHashes.push(canonicalHash(st));
    }

    levelReplays.push({
      levelId: id,
      minMoves: level.solution!.length,
      stepHashes,
      finalWon: st.isWon,
    });
  }

  const dataset: GoldenDataset = {
    version: '1.0.0',
    seed,
    totalCases: cases.length,
    cases,
    levelReplays,
  };

  const jsonContent = JSON.stringify(dataset, null, 2);
  fs.writeFileSync(targetPath, jsonContent, 'utf-8');

  const sha256 = crypto.createHash('sha256').update(jsonContent).digest('hex');

  return {
    filePath: targetPath,
    sha256,
    totalCases: cases.length,
    totalReplays: levelReplays.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('export_golden.ts')) {
  const outputPath = path.resolve(import.meta.dirname, '../shared/golden/golden_dataset.json');
  console.log('Exporting Golden Dataset (>= 5000 cases)...');
  const res = exportGoldenDataset(outputPath, 5000);
  console.log(`Exported ${res.totalCases} cases and ${res.totalReplays} level replays.`);
  console.log(`File: ${res.filePath}`);
  console.log(`SHA-256 Checksum: ${res.sha256}`);
}
