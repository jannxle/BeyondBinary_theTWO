import React from 'react';
import { Eye, MessageSquare } from 'lucide-react';

export default function ModeSelector({ mode, setMode }) {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: '#F5F5F5',
      borderRadius: '16px',
      marginBottom: '2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <button
        onClick={() => setMode('gesture')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 2.5rem',
          borderRadius: '12px',
          border: mode === 'gesture' ? '3px solid #0077BB' : '3px solid transparent',
          backgroundColor: mode === 'gesture' ? '#E6F3FF' : 'white',
          color: '#0077BB',
          fontSize: '1.1rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: mode === 'gesture' ? 'scale(1.05)' : 'scale(1)',
          boxShadow: mode === 'gesture' ? '0 4px 12px rgba(0, 119, 187, 0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
        onMouseEnter={(e) => {
          if (mode !== 'gesture') {
            e.target.style.backgroundColor = '#E6F3FF';
            e.target.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'gesture') {
            e.target.style.backgroundColor = 'white';
            e.target.style.transform = 'scale(1)';
          }
        }}
      >
        <Eye size={24} strokeWidth={2.5} />
        Vision Mode
      </button>
      <button
        onClick={() => setMode('speech')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 2.5rem',
          borderRadius: '12px',
          border: mode === 'speech' ? '3px solid #EE7733' : '3px solid transparent',
          backgroundColor: mode === 'speech' ? '#FFF0E6' : 'white',
          color: '#EE7733',
          fontSize: '1.1rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: mode === 'speech' ? 'scale(1.05)' : 'scale(1)',
          boxShadow: mode === 'speech' ? '0 4px 12px rgba(238, 119, 51, 0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
        onMouseEnter={(e) => {
          if (mode !== 'speech') {
            e.target.style.backgroundColor = '#FFF0E6';
            e.target.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'speech') {
            e.target.style.backgroundColor = 'white';
            e.target.style.transform = 'scale(1)';
          }
        }}
      >
        <MessageSquare size={24} strokeWidth={2.5} />
        Speech Mode
      </button>
    </div>
  );
}