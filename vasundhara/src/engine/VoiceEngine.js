export const VoiceEngine = {
  speak: (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  },
  stop: () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
  },
  listen: (onResult, onEnd) => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { if (onEnd) onEnd(); return null; }
    const r = new Recognition();
    r.lang = 'hi-IN';
    r.continuous = false;
    r.onresult = (e) => onResult(e.results[0][0].transcript);
    r.onend = () => { if (onEnd) onEnd(); };
    r.onerror = () => { if (onEnd) onEnd(); };
    r.start();
    return r;
  }
};
