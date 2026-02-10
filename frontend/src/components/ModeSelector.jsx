import React from 'react';
import { Hand, MessageSquare } from 'lucide-react';

export default function ModeSelector({ mode, setMode }) {
  return (
    <div className="mode-selector">
      <button
        onClick={() => setMode('gesture')}
        className={`mode-button ${mode === 'gesture' ? 'active' : ''}`}
      >
        <Hand size={22} />
        Gesture Mode
      </button>
      <button
        onClick={() => setMode('speech')}
        className={`mode-button ${mode === 'speech' ? 'active' : ''}`}
      >
        <MessageSquare size={22} />
        Speech Mode
      </button>
    </div>
  );
}