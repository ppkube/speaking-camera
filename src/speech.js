const PHRASES = {
  en: {
    Thumb_Up: 'Great job!',
    Thumb_Down: 'That\'s not good.',
    Victory: 'We won! Victory!',
    Open_Palm: 'Hello there!',
    Closed_Fist: 'Power!',
    Pointing_Up: 'Look up!',
    ILoveYou: 'I love you!',
  },
  zh: {
    Thumb_Up: '太棒了！',
    Thumb_Down: '不太好。',
    Victory: '胜利！我们赢了！',
    Open_Palm: '你好！',
    Closed_Fist: '加油！',
    Pointing_Up: '往上看！',
    ILoveYou: '我爱你！',
  },
};

export function speak(gestureName, lang) {
  const phrases = PHRASES[lang];
  if (!phrases || !phrases[gestureName]) return;

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrases[gestureName]);
  utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}

export function getPhrase(gestureName, lang) {
  return PHRASES[lang]?.[gestureName] || '';
}
