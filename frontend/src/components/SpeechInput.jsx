import React from 'react';
import { Mic } from 'lucide-react';

export default function SpeechInput({ isListening, toggleListening, isTranscribing }) {
  return (
    <div style={{ 
      padding: '3rem 2rem', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '450px',
      backgroundColor: '#F5F5F5',
      borderRadius: '16px',
      border: isListening ? '4px solid #EE7733' : '4px solid transparent',
      boxShadow: isListening ? '0 8px 24px rgba(238, 119, 51, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Microphone Icon with pulse animation */}
      <div style={{ 
        marginBottom: '2rem',
        transition: 'all 0.3s ease',
        animation: isListening ? 'pulse 1.5s infinite' : 'none'
      }}>
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          backgroundColor: isListening ? '#FFF0E6' : '#E6F3FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `6px solid ${isListening ? '#EE7733' : '#0077BB'}`,
          boxShadow: isListening 
            ? '0 8px 24px rgba(238, 119, 51, 0.4)' 
            : '0 4px 12px rgba(0, 119, 187, 0.2)'
        }}>
          <Mic 
            size={60} 
            color={isListening ? '#EE7733' : '#0077BB'}
            strokeWidth={2.5}
          />
        </div>
      </div>
      
      {/* Status Text */}
      <p style={{ 
        fontSize: '1.8rem', 
        marginBottom: '2.5rem',
        fontWeight: '700',
        color: isTranscribing ? '#EE7733' : isListening ? '#CC3311' : '#0077BB',
        transition: 'color 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {isTranscribing ? 'Transcribing...' : 
         isListening ? 'Recording...' : 
         'Ready to Listen'}
      </p>
      
      {/* Start/Stop Button */}
      <button 
        onClick={toggleListening}
        disabled={isTranscribing}
        style={{
          padding: '1.25rem 3.5rem',
          fontSize: '1.2rem',
          fontWeight: '700',
          borderRadius: '14px',
          border: 'none',
          backgroundColor: isTranscribing ? '#888888' : 
                          isListening ? '#CC3311' : 
                          '#009988',
          color: 'white',
          cursor: isTranscribing ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isListening 
            ? '0 6px 20px rgba(204, 51, 17, 0.4)' 
            : '0 6px 20px rgba(0, 153, 136, 0.4)',
          transform: isListening ? 'scale(1.08)' : 'scale(1)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
        onMouseEnter={(e) => {
          if (!isTranscribing) {
            e.target.style.transform = 'scale(1.08)';
            e.target.style.boxShadow = isListening 
              ? '0 8px 24px rgba(204, 51, 17, 0.5)' 
              : '0 8px 24px rgba(0, 153, 136, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isTranscribing) {
            e.target.style.transform = isListening ? 'scale(1.08)' : 'scale(1)';
            e.target.style.boxShadow = isListening 
              ? '0 6px 20px rgba(204, 51, 17, 0.4)' 
              : '0 6px 20px rgba(0, 153, 136, 0.4)';
          }
        }}
      >
        {isTranscribing ? '⏳ Processing...' :
         isListening ? '⏹ Stop Recording' : 
         '🎤 Start Listening'}
      </button>

      {/* Helper Text */}
      {!isListening && !isTranscribing && (
        <p style={{ 
          marginTop: '2rem',
          fontSize: '1rem',
          color: '#666666',
          maxWidth: '400px',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          Click the button above to start recording your voice.
          Click stop when you're done speaking.
        </p>
      )}

      {/* Processing Indicator */}
      {isTranscribing && (
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          backgroundColor: '#FFF0E6',
          borderRadius: '10px',
          border: '2px solid #EE7733'
        }}>
          <div className="spinner" style={{
            width: '24px',
            height: '24px',
            border: '4px solid #FFF0E6',
            borderTop: '4px solid #EE7733',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ 
            color: '#EE7733', 
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            Converting speech to text...
          </span>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}