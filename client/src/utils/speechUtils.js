let voices = [];

// This function will be called when the browser has loaded the available voices.
const loadVoices = () => {
  voices = window.speechSynthesis.getVoices();
};

// If voices change, this event listener will reload them.
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Speaks the given text using the browser's SpeechSynthesis API.
 * @param {string} text The text to be spoken.
 * @param {Function} onEndCallback A function to be called when the speech finishes.
 */
export const speak = (text, onEndCallback) => {
  // Check for browser support
  if (!('speechSynthesis' in window)) {
    console.error("Sorry, your browser does not support text-to-speech.");
    return;
  }

  // If the browser is already speaking, cancel it to say the new thing.
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  // Ensure there is text to speak
  if (!text) {
    console.error("Speak function called with no text.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // *** THE KEY CHANGE: Execute the callback when speech ends ***
  utterance.onend = () => {
    if (onEndCallback) {
      onEndCallback();
    }
  };

  // Load voices if they haven't been loaded yet
  if (voices.length === 0) {
    loadVoices();
  }

  // Optional configurations
  utterance.rate = 1.2;
  utterance.pitch = 1;

  // Small timeout to give the cancel function time to work, if needed
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
};