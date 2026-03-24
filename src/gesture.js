import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

export async function createRecognizer() {
  const vision = await FilesetResolver.forVisionTasks('/mediapipe-wasm');
  const recognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/gesture_recognizer.task',
    },
    runningMode: 'VIDEO',
    numHands: 1,
  });
  return recognizer;
}

export function recognizeFrame(recognizer, video, timestamp) {
  const result = recognizer.recognizeForVideo(video, timestamp);
  if (result.gestures.length > 0 && result.gestures[0].length > 0) {
    const gesture = result.gestures[0][0];
    return { gesture: gesture.categoryName, confidence: gesture.score };
  }
  return null;
}
