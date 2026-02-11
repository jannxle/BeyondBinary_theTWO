import React from 'react';
import { Volume2 } from 'lucide-react';

export default function OutputDisplay({ mode, gestureDetected, recognizedText, speakText }) {
  return (
    <div style={{
      marginTop: '2rem',
      padding: '2rem',
      borderRadius: '16px',
      backgroundColor: '#F5F5F5',
      border: '3px solid #E0E0E0',
      minHeight: '150px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      {mode === 'gesture' && gestureDetected && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0077BB',
            marginBottom: '0.5rem'
          }}>
            {gestureDetected}
          </p>
          <p style={{
            fontSize: '1rem',
            color: '#666666',
            fontWeight: '500'
          }}>
            Gesture Detected
          </p>
        </div>
      )}

      {mode === 'speech' && recognizedText && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: '#333333',
              margin: 0,
              lineHeight: '1.6',
              flex: 1
            }}>
              "{recognizedText}"
            </p>
          </div>
          <button
            onClick={() => speakText(recognizedText)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.875rem 1.75rem',
              borderRadius: '10px',
              border: '2px solid #009988',
              backgroundColor: 'white',
              color: '#009988',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#009988';
              e.target.style.color = 'white';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#009988';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <Volume2 size={20} />
            Speak Aloud
          </button>
        </div>
      )}

      {((mode === 'gesture' && !gestureDetected) || (mode === 'speech' && !recognizedText)) && (
        <p style={{
          fontSize: '1.2rem',
          color: '#999999',
          textAlign: 'center',
          fontWeight: '500',
          padding: '2rem'
        }}>
          Waiting for input...
        </p>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}