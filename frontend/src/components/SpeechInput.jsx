import React from 'react';

export default function SpeechInput({ isListening, toggleListening, isTranscribing }) {
  return (
    <div className="speech-input" style={{ 
      padding: '2rem', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px'
    }}>
      
      {/* Microphone Icon */}
      <div className="microphone-icon" style={{ 
        marginBottom: '2rem',
        transition: 'all 0.3s ease'
      }}>
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={isListening ? "#3b82f6" : "#d1d5db"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </div>
      
      {/* Status Text */}
      <p className="status-text" style={{ 
        fontSize: '1.5rem', 
        marginBottom: '2rem',
        fontWeight: '500',
        color: isTranscribing ? '#f59e0b' : isListening ? '#3b82f6' : '#9ca3af',
        transition: 'color 0.3s ease'
      }}>
        {isTranscribing ? 'Transcribing...' : 
         isListening ? 'Recording...' : 
         'Ready'}
      </p>
      
      {/* Start/Stop Button */}
      <button 
        onClick={toggleListening}
        className={`listen-button ${isListening ? 'active' : ''}`}
        disabled={isTranscribing}
        style={{
          padding: '1rem 3rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: isTranscribing ? '#9ca3af' : 
                          isListening ? '#ef4444' : 
                          '#3b82f6',
          color: 'white',
          cursor: isTranscribing ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isListening ? '0 4px 12px rgba(239, 68, 68, 0.4)' : 
                                  '0 4px 12px rgba(59, 130, 246, 0.4)',
          transform: isListening ? 'scale(1.05)' : 'scale(1)',
        }}
        onMouseEnter={(e) => {
          if (!isTranscribing) {
            e.target.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isTranscribing) {
            e.target.style.transform = isListening ? 'scale(1.05)' : 'scale(1)';
          }
        }}
      >
        {isTranscribing ? 'Processing...' :
         isListening ? 'Stop Recording' : 
         'Start Listening'}
      </button>

      {/* Helper Text */}
      {!isListening && !isTranscribing && (
        <p style={{ 
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#6b7280',
          maxWidth: '300px'
        }}>
          Click the button above to start recording your voice.
          Click stop when done.
        </p>
      )}

      {/* Processing Indicator */}
      {isTranscribing && (
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <div className="spinner" style={{
            width: '20px',
            height: '20px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Converting speech to text...
          </span>
        </div>
      )}

      {/* Add CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}