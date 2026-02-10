import React from 'react';
import { Volume2 } from 'lucide-react';

export default function OutputDisplay({ mode, gestureDetected, recognizedText, speakText }) {
  const handleSpeakHover = (e, isHovering) => {
    if (isHovering) {
      e.target.style.background = '#5ac8fa';
      e.target.style.color = 'white';
    } else {
      e.target.style.background = 'white';
      e.target.style.color = '#5ac8fa';
    }
  };

  return (
    <div className="output-card">
      {mode === 'gesture' && gestureDetected && (
        <div className="output-content fade-in">
          <p className="gesture-text">{gestureDetected}</p>
          <p className="gesture-label">Gesture Detected</p>
        </div>
      )}

      {mode === 'speech' && recognizedText && (
        <div className="output-content fade-in">
          <p className="speech-text">"{recognizedText}"</p>
          <button
            onClick={() => speakText(recognizedText)}
            className="speak-button"
            onMouseEnter={(e) => handleSpeakHover(e, true)}
            onMouseLeave={(e) => handleSpeakHover(e, false)}
          >
            <Volume2 size={18} />
            Speak Aloud
          </button>
        </div>
      )}

      {((mode === 'gesture' && !gestureDetected) || (mode === 'speech' && !recognizedText)) && (
        <p className="waiting-text">Waiting for input...</p>
      )}
    </div>
  );
}