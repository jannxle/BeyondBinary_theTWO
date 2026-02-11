import React, { useEffect } from 'react';
import { Settings, Type, Contrast, Volume2, RotateCcw } from 'lucide-react';

export default function AccessibilitySettings({ 
  settings, 
  onSettingsChange, 
  showSettings, 
  setShowSettings 
}) {
  const textSizes = [
    { value: 'small', label: 'Small', scale: 0.9 },
    { value: 'medium', label: 'Medium', scale: 1.0 },
    { value: 'large', label: 'Large', scale: 1.2 },
    { value: 'xlarge', label: 'Extra Large', scale: 1.4 }
  ];

  const contrastModes = [
    { value: 'normal', label: 'Normal', bg: '#FFFFFF', text: '#333333' },
    { value: 'high-black', label: 'High Contrast (Black)', bg: '#000000', text: '#FFFFFF' },
    { value: 'high-yellow', label: 'High Contrast (Yellow)', bg: '#000000', text: '#FFFF00' },
    { value: 'inverted', label: 'Inverted', bg: '#1a1a1a', text: '#FFFFFF' }
  ];

  // Apply text size to the document root
  useEffect(() => {
    const currentSize = textSizes.find(s => s.value === settings.textSize);
    if (currentSize) {
      document.documentElement.style.fontSize = `${currentSize.scale * 16}px`;
    }
  }, [settings.textSize]);

  // Apply contrast mode to the document
  useEffect(() => {
    const currentMode = contrastModes.find(m => m.value === settings.contrastMode);
    if (currentMode) {
      document.documentElement.style.setProperty('--bg-color', currentMode.bg);
      document.documentElement.style.setProperty('--text-color', currentMode.text);
      
      // Also apply to body for immediate effect
      document.body.style.backgroundColor = currentMode.bg;
      document.body.style.color = currentMode.text;
    }
  }, [settings.contrastMode]);

  const resetSettings = () => {
    onSettingsChange({
      textSize: 'medium',
      contrastMode: 'normal',
      speechSpeed: 1.0
    });
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#0077BB',
          color: 'white',
          border: '3px solid white',
          boxShadow: '0 4px 20px rgba(0, 119, 187, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1) rotate(90deg)';
          e.target.style.boxShadow = '0 6px 30px rgba(0, 119, 187, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1) rotate(0deg)';
          e.target.style.boxShadow = '0 4px 20px rgba(0, 119, 187, 0.4)';
        }}
      >
        <Settings size={28} />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={() => setShowSettings(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '2.5rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#0077BB',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Settings size={32} />
                Accessibility Settings
              </h2>
              <button
                onClick={resetSettings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F5F5F5',
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#666'
                }}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>

            {/* Text Size */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.3rem',
                fontWeight: '700',
                color: '#333',
                marginBottom: '1rem'
              }}>
                <Type size={24} />
                Text Size
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                {textSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => onSettingsChange({ ...settings, textSize: size.value })}
                    style={{
                      padding: '1rem',
                      fontSize: `${size.scale}rem`,
                      fontWeight: '600',
                      border: settings.textSize === size.value 
                        ? '3px solid #0077BB' 
                        : '2px solid #E0E0E0',
                      backgroundColor: settings.textSize === size.value 
                        ? '#E6F3FF' 
                        : 'white',
                      color: settings.textSize === size.value 
                        ? '#0077BB' 
                        : '#333',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contrast Mode */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.3rem',
                fontWeight: '700',
                color: '#333',
                marginBottom: '1rem'
              }}>
                <Contrast size={24} />
                Contrast Mode
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {contrastModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => onSettingsChange({ ...settings, contrastMode: mode.value })}
                    style={{
                      padding: '1.25rem',
                      fontWeight: '600',
                      border: settings.contrastMode === mode.value 
                        ? '3px solid #0077BB' 
                        : '2px solid #E0E0E0',
                      backgroundColor: mode.bg,
                      color: mode.text,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '1rem'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speech Speed */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.3rem',
                fontWeight: '700',
                color: '#333',
                marginBottom: '1rem'
              }}>
                <Volume2 size={24} />
                Speech Speed
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.speechSpeed}
                  onChange={(e) => onSettingsChange({ ...settings, speechSpeed: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '5px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  color: '#666',
                  fontWeight: '600'
                }}>
                  <span>0.5x (Slower)</span>
                  <span style={{ color: '#0077BB', fontSize: '1.2rem' }}>
                    {settings.speechSpeed.toFixed(1)}x
                  </span>
                  <span>2.0x (Faster)</span>
                </div>
                {/* Test button */}
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      const utterance = new SpeechSynthesisUtterance('This is a test of the speech speed setting');
                      utterance.rate = settings.speechSpeed;
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#0077BB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  Test Speed
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '1.25rem',
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}
            >
              Close Settings
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}