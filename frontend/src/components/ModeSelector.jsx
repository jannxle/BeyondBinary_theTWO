import React from 'react';
import { Eye, MessageSquare } from 'lucide-react';

export default function ModeSelector({ mode, setMode }) {
  return (
    <div style={{
      display: 'inline-flex',
      gap: '0.5rem',
      padding: '0.375rem',
      backgroundColor: '#f1f5f9',
      borderRadius: '14px',
      border: '1px solid #e2e8f0',
      marginBottom: '2rem'
    }}>
      <button
        onClick={() => setMode('gesture')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.75rem',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: mode === 'gesture' ? '#ffffff' : 'transparent',
          color: mode === 'gesture' ? '#0f172a' : '#64748b',
          fontSize: '0.9375rem',
          fontWeight: mode === 'gesture' ? '600' : '500',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: mode === 'gesture' 
            ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)' 
            : 'none',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (mode !== 'gesture') {
            e.currentTarget.style.color = '#334155';
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'gesture') {
            e.currentTarget.style.color = '#64748b';
          }
        }}
      >
        <Eye size={18} strokeWidth={2} />
        Vision Mode
      </button>
      
      <button
        onClick={() => setMode('speech')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.75rem',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: mode === 'speech' ? '#ffffff' : 'transparent',
          color: mode === 'speech' ? '#0f172a' : '#64748b',
          fontSize: '0.9375rem',
          fontWeight: mode === 'speech' ? '600' : '500',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: mode === 'speech' 
            ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)' 
            : 'none',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (mode !== 'speech') {
            e.currentTarget.style.color = '#334155';
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'speech') {
            e.currentTarget.style.color = '#64748b';
          }
        }}
      >
        <MessageSquare size={18} strokeWidth={2} />
        Speech Mode
      </button>
    </div>
  );
}