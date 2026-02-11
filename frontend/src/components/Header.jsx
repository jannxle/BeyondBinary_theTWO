import React from 'react';

export default function Header() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Playwrite+NZ+Basic:wght@100..400&display=swap" rel="stylesheet" />
      
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        marginBottom: '3rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '1.875rem',
            fontWeight: '400',
            color: '#0f172a',
            letterSpacing: '-0.025em',
            fontFamily: '"Playwrite NZ Basic", cursive'
          }}>
            Hand2Voice
          </h1>
        <p style={{
          margin: '0.25rem 0 0 0',
          fontSize: '0.875rem',
          color: '#64748b',
          fontWeight: '400'
        }}>
          Your Communication Assistant
        </p>
      </div>
      

    </header>
    </>
  );
}