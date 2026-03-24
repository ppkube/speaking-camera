let audioCtx = null;

export function initAudio() {
  audioCtx = new AudioContext();
}

function playTone(freq, duration, type = 'sine', gainVal = 0.3, delay = 0) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainVal, audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration);
}

function playNoise(duration, gainVal = 0.2, delay = 0) {
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(gainVal, audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(audioCtx.currentTime + delay);
}

const SOUNDS = {
  // Applause feel: rising major chord arpeggio + noise bursts
  Thumb_Up(ctx) {
    playTone(262, 0.4, 'triangle', 0.25, 0);     // C4
    playTone(330, 0.35, 'triangle', 0.25, 0.08);  // E4
    playTone(392, 0.3, 'triangle', 0.25, 0.16);   // G4
    playTone(523, 0.4, 'triangle', 0.3, 0.24);    // C5
    playNoise(0.5, 0.15, 0);
    playNoise(0.3, 0.12, 0.15);
    playNoise(0.2, 0.1, 0.3);
  },

  // Boo feel: descending minor tones
  Thumb_Down(ctx) {
    playTone(350, 0.5, 'sawtooth', 0.15, 0);
    playTone(300, 0.5, 'sawtooth', 0.15, 0.12);
    playTone(250, 0.5, 'sawtooth', 0.15, 0.24);
    playTone(200, 0.7, 'sawtooth', 0.2, 0.36);
    playNoise(0.8, 0.08, 0);
  },

  // Cheering: fast ascending scale
  Victory(ctx) {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // C5 to C6
    notes.forEach((freq, i) => {
      playTone(freq, 0.3, 'square', 0.12, i * 0.06);
    });
    playNoise(0.4, 0.1, 0.3);
    playTone(1047, 0.6, 'sine', 0.25, 0.48);
  },

  // Hello chime: warm two-tone
  Open_Palm(ctx) {
    playTone(660, 0.4, 'sine', 0.3, 0);
    playTone(880, 0.5, 'sine', 0.25, 0.15);
  },

  // Low thud
  Closed_Fist(ctx) {
    playTone(80, 0.3, 'sine', 0.5, 0);
    playTone(60, 0.2, 'triangle', 0.3, 0.05);
    playNoise(0.15, 0.2, 0);
  },

  // High ding
  Pointing_Up(ctx) {
    playTone(1200, 0.6, 'sine', 0.3, 0);
    playTone(1800, 0.3, 'sine', 0.1, 0);
  },

  // Gentle ascending melody
  ILoveYou(ctx) {
    playTone(440, 0.4, 'sine', 0.25, 0);      // A4
    playTone(554, 0.4, 'sine', 0.25, 0.2);     // C#5
    playTone(659, 0.6, 'sine', 0.3, 0.4);      // E5
  },
};

export const GESTURE_LABELS = {
  Thumb_Up: '👍 Thumbs Up!',
  Thumb_Down: '👎 Thumbs Down!',
  Victory: '✌️ Victory!',
  Open_Palm: '🖐️ Hello!',
  Closed_Fist: '✊ Fist!',
  Pointing_Up: '☝️ Point!',
  ILoveYou: '🤟 I Love You!',
};

export function playGestureSound(gestureName) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  if (SOUNDS[gestureName]) SOUNDS[gestureName](audioCtx);
}

export function getGestureLabel(gestureName) {
  return GESTURE_LABELS[gestureName] || gestureName;
}
