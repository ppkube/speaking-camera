# Speaking Camera

A browser-based app that detects hand gestures via your webcam and plays sounds in response. Runs fully offline — no server or network needed after setup.

## Supported Gestures

| Gesture | Sound |
|---------|-------|
| 👍 Thumbs Up | Applause |
| 👎 Thumbs Down | Boo |
| ✌️ Victory | Cheering |
| 🖐️ Open Palm | Hello chime |
| ✊ Closed Fist | Drum hit |
| ☝️ Pointing Up | Ding |
| 🤟 I Love You | Melody |

## Setup

```bash
npm install
```

Download the MediaPipe gesture model and WASM files:

```bash
mkdir -p public/mediapipe-wasm
curl -L -o public/gesture_recognizer.task \
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/latest/gesture_recognizer.task"
cp node_modules/@mediapipe/tasks-vision/wasm/* public/mediapipe-wasm/
```

## Usage

```bash
npm run dev
```

Open the URL shown in terminal, click **Start Camera**, and show a gesture.

## Offline Build

```bash
npm run build
```

Serve the `dist/` folder with any static file server:

```bash
npx serve dist
```

## Tech Stack

- [MediaPipe Gesture Recognizer](https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer) — in-browser hand gesture detection via WASM
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — synthesized sounds (no audio files)
- [Vite](https://vite.dev) — dev server and bundler
