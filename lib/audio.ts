// Web Audio API Sound Effects & Generative Lo-Fi Ambient Engine
// Lo-Fi Chill arrangement:
// - Warm Lo-Fi Rhodes Piano Chords (Dmaj9 -> Bm9 -> Gmaj7 -> A6/9)
// - Neo-Soul Syncopated Lo-Fi Sub Bass
// - Lo-Fi Drum Kit (Mellow Kick with sidechain ducking, Woody Snare/Rim, Swung Hi-Hats & Shakers)
// - Essential Lo-Fi FX: Vinyl Crackle & Ambient Tape Hiss, Needle Drop, Analog Wow & Flutter
// - Tactile Vinyl Tape Stop effect on power-down
// - ASMR Ducking: Music gently yields when interacting with letter paper & wax seal
// Default: MUTED music, plays on user demand via Music Toggle

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicMasterGain: GainNode | null = null;
  private masterWarmthFilter: BiquadFilterNode | null = null;
  private asmrDuckingGain: GainNode | null = null;
  private chordBusGain: GainNode | null = null;
  private vinylSource: AudioBufferSourceNode | null = null;
  private vinylGain: GainNode | null = null;
  private vinylBuffer: AudioBuffer | null = null;
  private schedulerTimer: number | null = null;
  private nextBarTime: number = 0;
  private currentBarIndex: number = 0;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isMusicPlaying) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  // --- ASMR Ducking Helper: Nhún nhạc nhẹ để làm nổi bật âm thanh giấy và con dấu ---
  private triggerAsmrDucking(depth = 0.78, recoveryTime = 0.5) {
    if (!this.isMusicPlaying || !this.asmrDuckingGain || !this.ctx) return;
    try {
      const cur = this.ctx.currentTime;
      this.asmrDuckingGain.gain.cancelScheduledValues(cur);
      this.asmrDuckingGain.gain.setValueAtTime(this.asmrDuckingGain.gain.value, cur);
      this.asmrDuckingGain.gain.linearRampToValueAtTime(depth, cur + 0.035);
      this.asmrDuckingGain.gain.exponentialRampToValueAtTime(1.0, cur + recoveryTime);
    } catch {
      // Ignore audio scheduling collision
    }
  }

  // 1. Paper rustle - Forward (lật trang tới / mở bìa thư)
  public playPaperRustle() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Kích hoạt ASMR Ducking cho tiếng lật giấy
    this.triggerAsmrDucking(0.8, 0.45);

    try {
      const duration = 0.28;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.45;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + duration);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio errors
    }
  }

  // 2. Paper back - Reverse (lật ngược lại trang trước / trở về)
  public playPaperBack() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Kích hoạt ASMR Ducking cho tiếng lật ngược
    this.triggerAsmrDucking(0.8, 0.45);

    try {
      const duration = 0.26;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(420, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1550, ctx.currentTime + duration);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.005, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.14);

      oscGain.gain.setValueAtTime(0.035, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio errors
    }
  }

  // 3. Mechanical click / soft tick (chọn lựa chọn)
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Ignore audio errors
    }
  }

  // 4. Wax seal stamp thud ("cộp" khi vào màn hình vé)
  public playWaxSeal() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Kích hoạt ASMR Ducking sâu hơn cho tiếng dập dấu sáp
    this.triggerAsmrDucking(0.7, 0.65);

    try {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.2);

      oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);

      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.12);
    } catch {
      // Ignore audio errors
    }
  }

  // 5. Music box / glockenspiel chime (xuất vé / chúc mừng)
  public playChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Kích hoạt ASMR Ducking cho chuông chúc mừng
    this.triggerAsmrDucking(0.8, 0.75);

    try {
      const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = ctx.currentTime + idx * 0.08;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.09, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    } catch {
      // Ignore audio errors
    }
  }

  // ==========================================
  // 6. Generative Lo-Fi Chill Engine
  // ==========================================

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  // --- FX: Vinyl Crackle & Ambient Tape Hiss Generator ---
  private getOrCreateVinylBuffer(ctx: AudioContext): AudioBuffer {
    if (this.vinylBuffer && this.vinylBuffer.sampleRate === ctx.sampleRate) {
      return this.vinylBuffer;
    }

    const duration = 6.0;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Paul Kellet's filtered pink noise algorithm for analog tape hiss
    let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
    let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

    for (let i = 0; i < length; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.1538520;
      b3L = 0.86650 * b3L + whiteL * 0.3104856;
      b4L = 0.55000 * b4L + whiteL * 0.5329522;
      b5L = -0.7616 * b5L - whiteL * 0.0168980;
      const pinkL = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.022;
      b6L = whiteL * 0.115926;

      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.1538520;
      b3R = 0.86650 * b3R + whiteR * 0.3104856;
      b4R = 0.55000 * b4R + whiteR * 0.5329522;
      b5R = -0.7616 * b5R - whiteR * 0.0168980;
      const pinkR = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.022;
      b6R = whiteR * 0.115926;

      left[i] = pinkL * 0.65;
      right[i] = pinkR * 0.65;

      // Realistic vinyl dust crackles / occasional needle pops
      if (Math.random() < 0.00038) {
        const pop = (Math.random() * 0.5 + 0.3) * (Math.random() > 0.5 ? 1 : -1) * 0.22;
        left[i] += pop;
        right[i] += pop * 0.85;
        if (i + 1 < length) left[i + 1] += pop * -0.4;
        if (i + 2 < length) left[i + 2] += pop * 0.15;
      }
    }

    this.vinylBuffer = buffer;
    return buffer;
  }

  private startVinylAmbience(ctx: AudioContext, dest: AudioNode, startTime: number) {
    try {
      const buffer = this.getOrCreateVinylBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1700, startTime);
      filter.Q.setValueAtTime(0.7, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.025, startTime + 1.5);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      source.start(startTime);
      this.vinylSource = source;
      this.vinylGain = gain;
    } catch {
      // Ignore vinyl audio errors
    }
  }

  private stopVinylAmbience() {
    if (this.vinylGain && this.ctx) {
      try {
        const cur = this.ctx.currentTime;
        this.vinylGain.gain.setValueAtTime(this.vinylGain.gain.value, cur);
        this.vinylGain.gain.exponentialRampToValueAtTime(0.0001, cur + 0.3);
      } catch {
        // Ignore
      }
    }
    if (this.vinylSource) {
      try {
        const s = this.vinylSource;
        setTimeout(() => {
          try {
            s.stop();
            s.disconnect();
          } catch {
            // Ignore
          }
        }, 320);
      } catch {
        // Ignore
      }
      this.vinylSource = null;
    }
    this.vinylGain = null;
  }

  // --- FX: Needle Drop at Start ---
  private playNeedleDrop(ctx: AudioContext, dest: AudioNode, time: number) {
    try {
      // 1. Tonearm landing thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, time);
      osc.frequency.exponentialRampToValueAtTime(28, time + 0.09);

      oscGain.gain.setValueAtTime(0.001, time);
      oscGain.gain.linearRampToValueAtTime(0.05, time + 0.005);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);

      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.09);

      // 2. Initial surface groove friction
      const dur = 0.12;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2200, time);
      filter.Q.setValueAtTime(1.4, time);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, time);
      noiseGain.gain.linearRampToValueAtTime(0.035, time + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      noise.start(time);
      noise.stop(time + dur);
    } catch {
      // Ignore
    }
  }

  public playNeedleDropSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.playNeedleDrop(ctx, ctx.destination, ctx.currentTime);
  }

  // --- FX: Tape Stop / Vinyl Turntable Motor Brake when stopping music ---
  private playTapeStop(ctx: AudioContext, dest: AudioNode, time: number) {
    try {
      const duration = 0.45;

      // 1. Descending motor pitch whine
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + duration);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(500, time);
      filter.frequency.exponentialRampToValueAtTime(90, time + duration);

      oscGain.gain.setValueAtTime(0.001, time);
      oscGain.gain.linearRampToValueAtTime(0.045, time + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(dest);

      osc.start(time);
      osc.stop(time + duration);

      // 2. Vinyl needle drag / brake friction noise
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(1600, time);
      noiseFilter.frequency.exponentialRampToValueAtTime(260, time + duration);
      noiseFilter.Q.setValueAtTime(1.8, time);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, time);
      noiseGain.gain.linearRampToValueAtTime(0.04, time + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);

      noise.start(time);
      noise.stop(time + duration);
    } catch {
      // Ignore
    }
  }

  // --- Lo-Fi Drum Kit with Sidechain Ducking ---
  private playKick(ctx: AudioContext, dest: AudioNode, time: number, velocity = 1.0) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Warm sub pitch drop
    osc.type = "sine";
    osc.frequency.setValueAtTime(105, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.16);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(150, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.19 * velocity, time + 0.007);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.22);

    // Lo-Fi Sidechain Ducking: subtly ducks the chords & pads when kick hits
    if (this.chordBusGain && velocity > 0.7) {
      try {
        this.chordBusGain.gain.cancelScheduledValues(time);
        this.chordBusGain.gain.setValueAtTime(0.72, time);
        this.chordBusGain.gain.exponentialRampToValueAtTime(1.0, time + 0.22);
      } catch {
        // Ignore scheduling collision
      }
    }
  }

  private playSnareRim(ctx: AudioContext, dest: AudioNode, time: number, velocity = 1.0) {
    // 1. Woody rim tone
    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    tone.type = "triangle";
    tone.frequency.setValueAtTime(230, time);
    tone.frequency.exponentialRampToValueAtTime(125, time + 0.055);

    toneGain.gain.setValueAtTime(0.065 * velocity, time);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.065);

    tone.connect(toneGain);
    toneGain.connect(dest);
    tone.start(time);
    tone.stop(time + 0.065);

    // 2. Soft brush snare body
    const duration = 0.11;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1750, time);
    noiseFilter.Q.setValueAtTime(1.7, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.058 * velocity, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);

    noise.start(time);
    noise.stop(time + duration);
  }

  private playHiHat(
    ctx: AudioContext,
    dest: AudioNode,
    time: number,
    velocity = 0.7,
    isOpen = false
  ) {
    const duration = isOpen ? 0.13 : 0.045;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = "highpass";
    hpFilter.frequency.setValueAtTime(4200, time);

    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = "lowpass";
    lpFilter.frequency.setValueAtTime(isOpen ? 9500 : 8000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.025 * velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    noise.connect(hpFilter);
    hpFilter.connect(lpFilter);
    lpFilter.connect(gain);
    gain.connect(dest);

    noise.start(time);
    noise.stop(time + duration);
  }

  // --- Neo-Soul Lo-Fi Electric Sub Bass ---
  private playLoFiBass(
    ctx: AudioContext,
    dest: AudioNode,
    time: number,
    freq: number,
    duration = 1.0,
    velocity = 0.9
  ) {
    // 1. Deep sine sub oscillator
    const subOsc = ctx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(freq, time);

    // 2. Warm triangle octave oscillator for rich vintage body
    const warmOsc = ctx.createOscillator();
    warmOsc.type = "triangle";
    warmOsc.frequency.setValueAtTime(freq, time);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(190, time);

    const gain = ctx.createGain();
    const peakGain = 0.05 * velocity;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(peakGain, time + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    subOsc.connect(filter);
    warmOsc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    subOsc.start(time);
    warmOsc.start(time);
    subOsc.stop(time + duration);
    warmOsc.stop(time + duration);
  }

  // --- Warm Lo-Fi Rhodes Piano Chords ---
  private playWarmChord(
    ctx: AudioContext,
    dest: AudioNode,
    time: number,
    chord: { freqs: number[] }
  ) {
    chord.freqs.forEach((freq, idx) => {
      const strumTime = time + idx * 0.035; // 35ms humanized strum
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Mix of sine body with gentle tape wow vibrato
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, strumTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(4.2, strumTime);
      lfoGain.gain.setValueAtTime(1.2, strumTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(strumTime);
      lfo.stop(strumTime + 3.2);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(880, strumTime);
      filter.frequency.exponentialRampToValueAtTime(430, strumTime + 3.2);

      oscGain.gain.setValueAtTime(0.001, strumTime);
      oscGain.gain.linearRampToValueAtTime(0.021, strumTime + 0.12);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, strumTime + 3.2);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(dest);

      osc.start(strumTime);
      osc.stop(strumTime + 3.2);
    });
  }

  // --- Bar Scheduler ---
  private scheduleBar(
    ctx: AudioContext,
    startTime: number,
    barIndex: number,
    beatSec: number,
    swingSec: number
  ) {
    if (!this.musicMasterGain || !this.chordBusGain || !this.asmrDuckingGain) return;

    // 1. Lo-Fi Jazz Progression: Dmaj9 -> Bm9 -> Gmaj7 -> A6/9
    const progressions = [
      { freqs: [293.66, 369.99, 440.0, 554.37, 659.25] }, // Dmaj9 (D4, F#4, A4, C#5, E5)
      { freqs: [246.94, 293.66, 369.99, 440.0, 554.37] }, // Bm9 (B3, D4, F#4, A4, C#5)
      { freqs: [196.0, 246.94, 293.66, 369.99, 440.0] },  // Gmaj7 (G3, B3, D4, F#4, A4)
      { freqs: [220.0, 277.18, 329.63, 369.99, 493.88] }, // A6/9 (A3, C#4, E4, F#4, B4)
    ];

    const chord = progressions[barIndex % progressions.length];
    this.playWarmChord(ctx, this.chordBusGain, startTime, chord);

    // 2. Neo-Soul Syncopated Bassline (connects to asmrDuckingGain)
    const bassPatterns = [
      // Bar 0: D root (D2 73.42) -> 5th (A2 110) -> passing (C#2 69.30)
      [
        { beat: 0.0, freq: 73.42, dur: 1.4, vel: 0.95, swing: false },
        { beat: 2.5, freq: 110.0, dur: 0.75, vel: 0.65, swing: true },
        { beat: 3.5, freq: 69.30, dur: 0.55, vel: 0.6, swing: true },
      ],
      // Bar 1: B root (B1 61.74) -> 5th (F#2 92.5) -> passing (A1 55.0)
      [
        { beat: 0.0, freq: 61.74, dur: 1.4, vel: 0.95, swing: false },
        { beat: 2.5, freq: 92.50, dur: 0.75, vel: 0.65, swing: true },
        { beat: 3.5, freq: 55.0, dur: 0.55, vel: 0.6, swing: true },
      ],
      // Bar 2: G root (G1 49.0) -> 5th (D2 73.42) -> octave (G2 98.0)
      [
        { beat: 0.0, freq: 49.0, dur: 1.4, vel: 0.95, swing: false },
        { beat: 2.5, freq: 73.42, dur: 0.75, vel: 0.65, swing: true },
        { beat: 3.5, freq: 98.0, dur: 0.55, vel: 0.55, swing: true },
      ],
      // Bar 3: A root (A1 55.0) -> 5th (E2 82.41) -> passing (C#2 69.30)
      [
        { beat: 0.0, freq: 55.0, dur: 1.4, vel: 0.95, swing: false },
        { beat: 2.5, freq: 82.41, dur: 0.75, vel: 0.65, swing: true },
        { beat: 3.5, freq: 69.30, dur: 0.55, vel: 0.6, swing: true },
      ],
    ];

    const currentBass = bassPatterns[barIndex % bassPatterns.length];
    currentBass.forEach((note) => {
      const noteTime = startTime + note.beat * beatSec + (note.swing ? swingSec : 0);
      this.playLoFiBass(ctx, this.asmrDuckingGain!, noteTime, note.freq, note.dur, note.vel);
    });

    // 3. Lo-Fi Drum Pattern (Kick, Snare/Rim, Hi-Hats & Shaker, all into asmrDuckingGain)
    // Beat 1 (t = 0)
    this.playKick(ctx, this.asmrDuckingGain, startTime, 1.0);
    this.playHiHat(ctx, this.asmrDuckingGain, startTime, 0.85);

    // Beat 1.5 (t = 0.5 + swing)
    this.playHiHat(ctx, this.asmrDuckingGain, startTime + beatSec * 0.5 + swingSec, 0.5);

    // Beat 2 (t = 1.0)
    this.playSnareRim(ctx, this.asmrDuckingGain, startTime + beatSec, 1.0);
    this.playHiHat(ctx, this.asmrDuckingGain, startTime + beatSec, 0.75);

    // Beat 2.5 (t = 1.5 + swing) -> Ghost Kick & Hat
    this.playKick(ctx, this.asmrDuckingGain, startTime + beatSec * 1.5 + swingSec, 0.65);
    this.playHiHat(ctx, this.asmrDuckingGain, startTime + beatSec * 1.5 + swingSec, 0.55);

    // Beat 3 (t = 2.0)
    this.playKick(ctx, this.asmrDuckingGain, startTime + beatSec * 2.0, 0.88);
    this.playHiHat(ctx, this.asmrDuckingGain, startTime + beatSec * 2.0, 0.75);

    // Beat 3.5 (t = 2.5 + swing)
    this.playHiHat(ctx, this.asmrDuckingGain, startTime + beatSec * 2.5 + swingSec, 0.6);

    // Beat 4 (t = 3.0)
    this.playSnareRim(ctx, this.asmrDuckingGain, startTime + beatSec * 3.0, 0.95);
    this.playHiHat(ctx, this.asmrDuckingGain, startTime + beatSec * 3.0, 0.75);

    // Beat 4.5 (t = 3.5 + swing) -> Open Hi-Hat / Shaker Swish
    this.playHiHat(ctx, this.asmrDuckingGain, startTime + beatSec * 3.5 + swingSec, 0.65, true);
  }

  public startMusic() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Master bus for music with vintage warmth filter and master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 1.2);

    const masterWarmth = ctx.createBiquadFilter();
    masterWarmth.type = "lowpass";
    masterWarmth.frequency.setValueAtTime(4200, ctx.currentTime);
    this.masterWarmthFilter = masterWarmth;

    masterGain.connect(masterWarmth);
    masterWarmth.connect(ctx.destination);
    this.musicMasterGain = masterGain;

    // ASMR Ducking Gain (sits right before master gain)
    const asmrDucking = ctx.createGain();
    asmrDucking.gain.setValueAtTime(1.0, ctx.currentTime);
    asmrDucking.connect(masterGain);
    this.asmrDuckingGain = asmrDucking;

    // Chord bus (enables sidechain ducking when kick hits, connects into asmrDucking)
    const chordBus = ctx.createGain();
    chordBus.gain.setValueAtTime(1.0, ctx.currentTime);
    chordBus.connect(asmrDucking);
    this.chordBusGain = chordBus;

    // 74 BPM - chill lo-fi groove
    const bpm = 74;
    const beatSec = 60 / bpm; // ~0.8108s
    const barSec = beatSec * 4; // ~3.243s
    const swingSec = beatSec * 0.08; // subtle MPC swing feel

    // 1. Play tactile Vinyl Needle Drop at start
    this.playNeedleDrop(ctx, masterGain, ctx.currentTime + 0.05);

    // 2. Start continuous Vinyl Crackle & Tape Hiss Ambience (into masterGain for constant room texture)
    this.startVinylAmbience(ctx, masterGain, ctx.currentTime + 0.1);

    this.currentBarIndex = 0;
    this.nextBarTime = ctx.currentTime + 0.25;

    // Web Audio lookahead scheduler
    const tick = () => {
      if (!this.isMusicPlaying || !this.musicMasterGain || this.isMuted) return;
      const current = ctx.currentTime;

      while (this.nextBarTime < current + 1.4) {
        this.scheduleBar(ctx, this.nextBarTime, this.currentBarIndex, beatSec, swingSec);
        this.currentBarIndex++;
        this.nextBarTime += barSec;
      }
    };

    // First bar
    tick();
    this.schedulerTimer = window.setInterval(tick, 200);
  }

  public stopMusic() {
    if (!this.isMusicPlaying) return;
    this.isMusicPlaying = false;

    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    const ctx = this.ctx;
    if (ctx && this.musicMasterGain) {
      try {
        const cur = ctx.currentTime;
        const stopDuration = 0.45;

        // 1. Phát hiệu ứng âm thanh Tape Stop / phanh đĩa than
        this.playTapeStop(ctx, ctx.destination, cur);

        // 2. Giảm tốc độ quay của vinyl loop
        if (this.vinylSource) {
          try {
            this.vinylSource.playbackRate.setValueAtTime(1.0, cur);
            this.vinylSource.playbackRate.exponentialRampToValueAtTime(0.08, cur + stopDuration);
          } catch {
            // Ignore
          }
        }

        // 3. Quét bộ lọc tần số xuống thấp mô phỏng đĩa than mất đà quay chậm
        if (this.masterWarmthFilter) {
          try {
            this.masterWarmthFilter.frequency.setValueAtTime(
              this.masterWarmthFilter.frequency.value,
              cur
            );
            this.masterWarmthFilter.frequency.exponentialRampToValueAtTime(120, cur + stopDuration);
          } catch {
            // Ignore
          }
        }

        // 4. Giảm âm lượng master nhịp nhàng theo cú dừng băng
        this.musicMasterGain.gain.setValueAtTime(this.musicMasterGain.gain.value, cur);
        this.musicMasterGain.gain.exponentialRampToValueAtTime(0.0001, cur + stopDuration);

        const oldMaster = this.musicMasterGain;
        const oldAsmr = this.asmrDuckingGain;
        const oldChord = this.chordBusGain;
        const oldFilter = this.masterWarmthFilter;

        setTimeout(() => {
          try {
            this.stopVinylAmbience();
            oldMaster.disconnect();
            oldAsmr?.disconnect();
            oldChord?.disconnect();
            oldFilter?.disconnect();
          } catch {
            // Ignore
          }
        }, 500);
      } catch {
        this.stopVinylAmbience();
      }

      this.musicMasterGain = null;
      this.asmrDuckingGain = null;
      this.chordBusGain = null;
      this.masterWarmthFilter = null;
    } else {
      this.stopVinylAmbience();
    }
  }
}

export const soundEngine = new SoundEngine();
