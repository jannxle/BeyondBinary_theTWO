import React, { useState, useEffect } from 'react';
import { Camera, CameraOff, Eye, Type, AlertTriangle, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export default function GestureInput({ 
  videoRef, 
  canvasRef, 
  isVideoActive, 
  toggleVideo,
  onCapture,
  analysisResult,
  isAnalyzing,
  speechSpeed = 1.0,
  onClearResult // Add this prop to allow clearing from parent
}) {
  const [selectedMode, setSelectedMode] = useState('general');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [modeResults, setModeResults] = useState({
    general: '',
    text: '',
    hazard: ''
  });
  const [analyzingMode, setAnalyzingMode] = useState(''); // Track which mode is being analyzed

  // Colorblind-friendly palette
  const modes = [
    { id: 'general', label: 'General View', icon: Eye, color: '#0077BB', bg: '#E6F3FF' },
    { id: 'text', label: 'Read Text', icon: Type, color: '#EE7733', bg: '#FFF0E6' },
    { id: 'hazard', label: 'Detect Hazards', icon: AlertTriangle, color: '#CC3311', bg: '#FFE6E6' }
  ];

  // Stop speaking when mode changes
  useEffect(() => {
    stopSpeaking();
  }, [selectedMode]);

  // Update result for the mode that was analyzed (not necessarily the current mode)
  useEffect(() => {
    if (analysisResult && analyzingMode) {
      setModeResults(prev => ({
        ...prev,
        [analyzingMode]: analysisResult
      }));
      setAnalyzingMode(''); // Clear the analyzing mode
    }
  }, [analysisResult, analyzingMode]);

  // Get the current mode's result
  const currentModeResult = modeResults[selectedMode];

  const handleCapture = () => {
    if (onCapture) {
      setAnalyzingMode(selectedMode); // Store which mode we're analyzing
      onCapture(selectedMode);
    }
  };

  const speakText = (text, saveAsLast = true) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Set speaking state
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      
      if (saveAsLast) {
        setLastMessage(text);
      }
    } else {
      alert('Text-to-speech is not supported in your browser');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const repeatLastMessage = () => {
    if (lastMessage) {
      speakText(lastMessage, false);
    }
  };

  // Update last message when current result changes
  useEffect(() => {
    if (currentModeResult && currentModeResult !== lastMessage) {
      setLastMessage(currentModeResult);
    }
  }, [currentModeResult]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* LEFT SIDE - Camera */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Video Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#2C2C2C',
            aspectRatio: '4/3',
            border: `4px solid ${modes.find(m => m.id === selectedMode)?.color || '#0077BB'}`
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isVideoActive ? 'block' : 'none'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'none'
              }}
            />
            {!isVideoActive && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <CameraOff size={64} color="#CCCCCC" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#CCCCCC', fontSize: '1.1rem', fontWeight: '500' }}>
                  Camera Inactive
                </p>
              </div>
            )}

            {/* Mode indicator overlay */}
            {isVideoActive && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: modes.find(m => m.id === selectedMode)?.color,
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                {React.createElement(modes.find(m => m.id === selectedMode)?.icon, { size: 18 })}
                {modes.find(m => m.id === selectedMode)?.label}
              </div>
            )}
          </div>

          {/* Camera Control Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={toggleVideo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isVideoActive ? '#CC3311' : '#0077BB',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                flex: 1
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
            >
              {isVideoActive ? <CameraOff size={20} /> : <Camera size={20} />}
              {isVideoActive ? 'Stop' : 'Start'}
            </button>

            <button
              onClick={handleCapture}
              disabled={!isVideoActive || isAnalyzing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: !isVideoActive || isAnalyzing ? '#888888' : '#009988',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: !isVideoActive || isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                opacity: !isVideoActive || isAnalyzing ? 0.6 : 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                flex: 1
              }}
              onMouseEnter={(e) => {
                if (isVideoActive && !isAnalyzing) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (isVideoActive && !isAnalyzing) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }
              }}
            >
              <Camera size={20} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {/* Reset Button (if stuck) */}
          {isAnalyzing && (
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: '2px solid #CC3311',
                backgroundColor: 'white',
                color: '#CC3311',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              ⚠️ Force Reset
            </button>
          )}
        </div>

        {/* RIGHT SIDE - Controls and Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Mode Selection */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#F5F5F5',
            borderRadius: '12px',
            border: '2px solid #E0E0E0'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#333333'
            }}>
              Select Analysis Mode
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 1.25rem',
                      borderRadius: '10px',
                      border: isSelected ? `3px solid ${mode.color}` : '3px solid transparent',
                      backgroundColor: isSelected ? mode.bg : 'white',
                      color: mode.color,
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSelected ? `0 4px 12px ${mode.color}40` : '0 2px 4px rgba(0,0,0,0.1)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = mode.bg;
                        e.target.style.transform = 'scale(1.01)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <Icon size={22} strokeWidth={2.5} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analysis Result Box */}
          <div style={{
            padding: '1.75rem',
            borderRadius: '12px',
            backgroundColor: currentModeResult ? modes.find(m => m.id === selectedMode)?.bg : '#F9F9F9',
            border: `3px solid ${currentModeResult ? modes.find(m => m.id === selectedMode)?.color : '#E0E0E0'}`,
            minHeight: '250px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {currentModeResult ? (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: modes.find(m => m.id === selectedMode)?.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {React.createElement(modes.find(m => m.id === selectedMode)?.icon, { size: 22 })}
                    Result
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {!isSpeaking ? (
                      <>
                        <button
                          onClick={() => speakText(currentModeResult)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: `2px solid ${modes.find(m => m.id === selectedMode)?.color}`,
                            backgroundColor: 'white',
                            color: modes.find(m => m.id === selectedMode)?.color,
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = modes.find(m => m.id === selectedMode)?.color;
                            e.target.style.color = 'white';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = modes.find(m => m.id === selectedMode)?.color;
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          <Volume2 size={18} />
                          Speak
                        </button>
                        {lastMessage && (
                          <button
                            onClick={repeatLastMessage}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              border: '2px solid #009988',
                              backgroundColor: 'white',
                              color: '#009988',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              whiteSpace: 'nowrap'
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
                            <RotateCcw size={18} />
                            Repeat
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={stopSpeaking}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '10px',
                          border: '2px solid #CC3311',
                          backgroundColor: '#CC3311',
                          color: 'white',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          whiteSpace: 'nowrap',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                        }}
                      >
                        <VolumeX size={18} />
                        Stop
                      </button>
                    )}
                  </div>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  lineHeight: '1.7',
                  color: '#333333',
                  fontWeight: '500'
                }}>
                  {currentModeResult}
                </p>
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#999999',
                  fontWeight: '500',
                  margin: 0
                }}>
                  {isVideoActive 
                    ? 'Select a mode and click Analyze' 
                    : 'Start camera to begin'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}