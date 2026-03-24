import { createRecognizer, recognizeFrame } from './gesture.js';
import { initAudio, playGestureSound, getGestureLabel, GESTURE_LABELS } from './sounds.js';

const DEBOUNCE_MS = 1500;

const SOUND_DESCRIPTIONS = {
  Thumb_Up: 'Applause',
  Thumb_Down: 'Boo',
  Victory: 'Cheering',
  Open_Palm: 'Hello chime',
  Closed_Fist: 'Drum hit',
  Pointing_Up: 'Ding',
  ILoveYou: 'Melody',
};

const overlay = document.getElementById('gesture-overlay');
const status = document.getElementById('status');
const toggleBtn = document.getElementById('toggle-btn');
const video = document.getElementById('webcam');
const gestureListEl = document.getElementById('gesture-list');

let lastGesture = null;
let lastGestureTime = 0;
let recognizer = null;
let stream = null;
let running = false;
let animFrameId = null;

// Build sidebar gesture list
const gestureItems = {};
for (const [key, label] of Object.entries(GESTURE_LABELS)) {
  const li = document.createElement('li');
  li.innerHTML = `<span>${label}</span><span class="sound-desc">${SOUND_DESCRIPTIONS[key] || ''}</span>`;
  gestureListEl.appendChild(li);
  gestureItems[key] = li;
}

function highlightGesture(name) {
  for (const [key, li] of Object.entries(gestureItems)) {
    li.classList.toggle('active', key === name);
  }
}

function showGesture(name) {
  overlay.textContent = getGestureLabel(name);
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
          playGestureSound(result.gesture);
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
