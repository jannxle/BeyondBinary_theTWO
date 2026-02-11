import React from 'react';

export default function Header() {
  return (
    <header style={{
      textAlign: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #0077BB 0%, #009988 100%)',
      borderRadius: '16px',
      marginBottom: '2rem',
      boxShadow: '0 8px 24px rgba(0, 119, 187, 0.3)'
    }}>
      <h1 style={{
        margin: '0 0 0.5rem 0',
        fontSize: '2.5rem',
        fontWeight: '800',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        letterSpacing: '1px'
      }}>
        Hand2Voice
      </h1>
      <p style={{
        margin: 0,
        fontSize: '1.2rem',
        color: '#E6F3FF',
        fontWeight: '500'
      }}>
        Your Communication Assistant
      </p>
    </header>
  );
}