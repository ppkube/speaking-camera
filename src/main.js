import { createRecognizer, recognizeFrame } from './gesture.js';
import { initAudio, playGestureSound, getGestureLabel, GESTURE_LABELS } from './sounds.js';
import { speak, getPhrase } from './speech.js';

const DEBOUNCE_MS = 1500;

const SOUND_DESCRIPTIONS = {
  sound: {
    Thumb_Up: 'Applause',
    Thumb_Down: 'Boo',
    Victory: 'Cheering',
    Open_Palm: 'Hello chime',
    Closed_Fist: 'Drum hit',
    Pointing_Up: 'Ding',
    ILoveYou: 'Melody',
  },
  en: {
    Thumb_Up: '"Great job!"',
    Thumb_Down: '"That\'s not good."',
    Victory: '"We won! Victory!"',
    Open_Palm: '"Hello there!"',
    Closed_Fist: '"Power!"',
    Pointing_Up: '"Look up!"',
    ILoveYou: '"I love you!"',
  },
  zh: {
    Thumb_Up: '"太棒了！"',
    Thumb_Down: '"不太好。"',
    Victory: '"胜利！我们赢了！"',
    Open_Palm: '"你好！"',
    Closed_Fist: '"加油！"',
    Pointing_Up: '"往上看！"',
    ILoveYou: '"我爱你！"',
  },
};

const overlay = document.getElementById('gesture-overlay');
const status = document.getElementById('status');
const toggleBtn = document.getElementById('toggle-btn');
const video = document.getElementById('webcam');
const gestureListEl = document.getElementById('gesture-list');
const modeBtns = document.querySelectorAll('.mode-btn');

let lastGesture = null;
let lastGestureTime = 0;
let recognizer = null;
let stream = null;
let running = false;
let animFrameId = null;
let currentMode = 'sound';

// Mode switcher
modeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    updateSidebarDescriptions();
  });
});

// Build sidebar gesture list
const gestureItems = {};
for (const [key, label] of Object.entries(GESTURE_LABELS)) {
  const li = document.createElement('li');
  li.innerHTML = `<span>${label}</span><span class="sound-desc">${SOUND_DESCRIPTIONS.sound[key] || ''}</span>`;
  gestureListEl.appendChild(li);
  gestureItems[key] = li;
}

function updateSidebarDescriptions() {
  const descs = SOUND_DESCRIPTIONS[currentMode] || SOUND_DESCRIPTIONS.sound;
  for (const [key, li] of Object.entries(gestureItems)) {
    const descEl = li.querySelector('.sound-desc');
    if (descEl) descEl.textContent = descs[key] || '';
  }
}

function highlightGesture(name) {
  for (const [key, li] of Object.entries(gestureItems)) {
    li.classList.toggle('active', key === name);
  }
}

function showGesture(name) {
  if (currentMode === 'sound') {
    overlay.textContent = getGestureLabel(name);
  } else {
    overlay.textContent = getPhrase(name, currentMode);
  }
  overlay.classList.add('visible');
  overlay.classList.remove('pop');
  void overlay.offsetWidth;
  overlay.classList.add('pop');
  highlightGesture(name);
}

function clearGesture() {
  overlay.classList.remove('visible');
  highlightGesture(null);
}

function playForGesture(gestureName) {
  if (currentMode === 'sound') {
    playGestureSound(gestureName);
  } else {
    speak(gestureName, currentMode);
  }
}

async function startCamera() {
  toggleBtn.disabled = true;
  initAudio();

  try {
    if (!recognizer) {
      status.textContent = 'Loading gesture model...';
      recognizer = await createRecognizer();
    }

    status.textContent = 'Starting camera...';
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    });
    video.srcObject = stream;
    await video.play();

    running = true;
    status.textContent = 'Running — show a gesture!';
    toggleBtn.textContent = 'Stop Camera';
    toggleBtn.classList.add('stop');
    toggleBtn.disabled = false;

    function loop() {
      if (!running) return;
      const result = recognizeFrame(recognizer, video, performance.now());
      if (result && result.gesture !== 'None') {
        const now = Date.now();
        if (result.gesture !== lastGesture || now - lastGestureTime > DEBOUNCE_MS) {
          lastGesture = result.gesture;
          lastGestureTime = now;
          showGesture(result.gesture);
          playForGesture(result.gesture);
        }
      } else {
        if (Date.now() - lastGestureTime > DEBOUNCE_MS) {
          lastGesture = null;
          clearGesture();
        }
      }
      animFrameId = requestAnimationFrame(loop);
    }
    animFrameId = requestAnimationFrame(loop);
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
    toggleBtn.disabled = false;
  }
}

function stopCamera() {
  running = false;
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  video.srcObject = null;
  lastGesture = null;
  lastGestureTime = 0;
  clearGesture();

  status.textContent = 'Camera stopped';
  toggleBtn.textContent = 'Start Camera';
  toggleBtn.classList.remove('stop');
}

toggleBtn.addEventListener('click', () => {
  if (running) {
    stopCamera();
  } else {
    startCamera();
  }
});
