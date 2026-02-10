import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function SpeechInput({ isListening, toggleListening }) {
  return (
    <>
      <div className="microphone-container">
        {isListening && (
          <>
            <div className="pulse-ring pulse-1" />
            <div className="pulse-ring pulse-2" />
          </>
        )}
        <Mic 
          size={80} 
          className={`mic-icon ${isListening ? 'active' : 'inactive'}`}
        />
        <p className="mic-status">
          {isListening ? 'Listening...' : 'Microphone Inactive'}
        </p>
      </div>
      <button
        onClick={toggleListening}
        className={`control-button ${isListening ? 'listening' : 'start'}`}
      >
        {isListening ? <MicOff size={22} /> : <Mic size={22} />}
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
    </>
  );
}