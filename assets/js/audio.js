/**
 * Ambient Audio Engine for Islamic Wedding Experience
 * Generates peaceful, cinematic acoustic harp & ambient chime chords using Web Audio API
 */

class AmbientAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.timer = null;
    this.currentChord = 0;
    
    // Soothing pentatonic / Lydian Islamic ambient frequency scale (D Major / A F# D progression)
    this.chords = [
      [293.66, 369.99, 440.0, 587.33, 739.99], // D maj9
      [246.94, 329.63, 392.0, 493.88, 659.25], // B min7
      [220.00, 277.18, 329.63, 440.0, 554.37], // A sus4 / C#
      [196.00, 246.94, 293.66, 392.0, 493.88], // G maj7
    ];
    
    this.initControls();
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playPluck(freq, delayTime = 0, gainLevel = 0.08) {
    if (!this.audioCtx || !this.isPlaying) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime + delayTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Warm harp & celestial tone
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, now); // subtle chorus detune

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 3.5);

    // Envelope
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(gainLevel, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 4);
    osc2.stop(now + 4);
  }

  playChordArpeggio() {
    if (!this.isPlaying) return;

    const chord = this.chords[this.currentChord];
    this.currentChord = (this.currentChord + 1) % this.chords.length;

    // Pluck notes with gentle harp delays
    chord.forEach((freq, index) => {
      const delay = index * 0.28 + (Math.random() * 0.05);
      this.playPluck(freq, delay, 0.07 - index * 0.008);
    });

    // Also occasional soft upper chime
    if (Math.random() > 0.4) {
      const upperFreq = chord[Math.floor(Math.random() * chord.length)] * 2;
      this.playPluck(upperFreq, 1.4 + Math.random() * 0.5, 0.03);
    }

    this.timer = setTimeout(() => {
      this.playChordArpeggio();
    }, 4200);
  }

  toggle() {
    this.initContext();
    const btn = document.getElementById('music-toggle-btn');
    const label = document.getElementById('music-label');
    const icon = document.getElementById('music-icon');

    if (this.isPlaying) {
      this.isPlaying = false;
      clearTimeout(this.timer);
      if (btn) btn.classList.remove('active');
      if (label) label.textContent = 'Play Music';
      if (icon) icon.innerHTML = '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
      this.isPlaying = true;
      this.playChordArpeggio();
      if (btn) btn.classList.add('active');
      if (label) label.textContent = 'Mute Music';
      if (icon) icon.innerHTML = '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>';
    }
  }

  initControls() {
    document.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('music-toggle-btn');
      if (btn) {
        btn.addEventListener('click', () => this.toggle());
      }
    });
  }
}

window.ambientAudio = new AmbientAudioEngine();
