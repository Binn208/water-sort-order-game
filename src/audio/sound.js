/**
 * Procedural Web Audio API Sound System for Meow Syrup Cafe.
 * High-performance, zero latency, no external audio files required, pitch randomized.
 */
class SoundSystem {
    ctx = null;
    soundEnabled = true;
    musicEnabled = true;
    bgmInterval = null;
    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    getRandomPitch(baseFreq) {
        // ±5% pitch shift
        const variation = (Math.random() * 0.1) - 0.05;
        return baseFreq * (1 + variation);
    }
    play(eventName) {
        if (!this.soundEnabled)
            return;
        this.initContext();
        if (!this.ctx)
            return;
        const t = this.ctx.currentTime;
        switch (eventName) {
            case 'jar_select': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(this.getRandomPitch(520), t);
                osc.frequency.exponentialRampToValueAtTime(this.getRandomPitch(660), t + 0.08);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.1);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.1);
                break;
            }
            case 'jar_deselect': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(this.getRandomPitch(440), t);
                osc.frequency.exponentialRampToValueAtTime(this.getRandomPitch(330), t + 0.08);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.09);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.09);
                break;
            }
            case 'jar_invalid': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(this.getRandomPitch(180), t);
                osc.frequency.linearRampToValueAtTime(this.getRandomPitch(130), t + 0.12);
                gain.gain.setValueAtTime(0.08, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.15);
                break;
            }
            case 'pour_start':
            case 'pour_flow_low':
            case 'pour_flow_mid':
            case 'pour_flow_high': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const baseFreq = eventName === 'pour_flow_high' ? 880 : eventName === 'pour_flow_mid' ? 620 : 440;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(this.getRandomPitch(baseFreq), t);
                osc.frequency.exponentialRampToValueAtTime(this.getRandomPitch(baseFreq * 1.25), t + 0.18);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.2);
                break;
            }
            case 'cork_pop': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(this.getRandomPitch(300), t);
                osc.frequency.exponentialRampToValueAtTime(this.getRandomPitch(800), t + 0.04);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.06);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.06);
                break;
            }
            case 'order_delivered':
            case 'customer_happy': {
                // Ding chord
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                    if (!this.ctx)
                        return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(this.getRandomPitch(freq), t + idx * 0.05);
                    gain.gain.setValueAtTime(0.12, t + idx * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45 + idx * 0.05);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t + idx * 0.05);
                    osc.stop(t + 0.5 + idx * 0.05);
                });
                break;
            }
            case 'win_fanfare': {
                [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
                    if (!this.ctx)
                        return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, t + idx * 0.08);
                    gain.gain.setValueAtTime(0.18, t + idx * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6 + idx * 0.08);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t + idx * 0.08);
                    osc.stop(t + 0.7 + idx * 0.08);
                });
                break;
            }
            case 'tool_undo': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(this.getRandomPitch(600), t);
                osc.frequency.exponentialRampToValueAtTime(this.getRandomPitch(320), t + 0.15);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.16);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.16);
                break;
            }
            case 'tool_add_jar': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(this.getRandomPitch(350), t);
                osc.frequency.exponentialRampToValueAtTime(this.getRandomPitch(700), t + 0.18);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.2);
                break;
            }
            case 'stuck_gentle': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(this.getRandomPitch(330), t);
                osc.frequency.linearRampToValueAtTime(this.getRandomPitch(260), t + 0.25);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.28);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.28);
                break;
            }
            default: {
                // Simple click
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(this.getRandomPitch(500), t);
                gain.gain.setValueAtTime(0.08, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.05);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.05);
            }
        }
    }
    startBgm() {
        if (!this.musicEnabled)
            return;
        this.initContext();
        if (!this.ctx || this.bgmInterval !== null)
            return;
        // Cozy lofi pentatonic background chord progression
        const chords = [
            [261.63, 329.63, 392.00], // C
            [220.00, 261.63, 329.63], // Am
            [174.61, 220.00, 261.63], // F
            [196.00, 246.94, 293.66], // G
        ];
        let chordIdx = 0;
        const playChord = () => {
            if (!this.musicEnabled || !this.ctx)
                return;
            const t = this.ctx.currentTime;
            const chord = chords[chordIdx % chords.length];
            chordIdx++;
            chord.forEach(freq => {
                if (!this.ctx)
                    return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.015, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 2.5);
            });
        };
        playChord();
        this.bgmInterval = window.setInterval(playChord, 2500);
    }
    stopBgm() {
        if (this.bgmInterval !== null) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
}
export const sound = new SoundSystem();
