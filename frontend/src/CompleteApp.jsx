import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import VoiceControl from './components/VoiceControl';
import UserProfile from './components/UserProfile';
import { api } from './services/api';

export default function App() {
  const [mode, setMode] = useState('gesture');
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentDescription, setCurrentDescription] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check if user is logged in from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('hand2voice_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadHistory(userData.email);
    }
  }, []);

  const loadHistory = async (email) => {
    const result = await api.getHistory(email);
    if (result.success) {
      setHistory(result.history);
    }
  };

  // ==================== CAMERA FUNCTIONS ====================

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
      
      speak('Camera started. Say analyze or press space to describe what I see.');
    } catch (error) {
      console.error('Camera error:', error);
      speak('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      speak('Camera stopped');
    }
  };

  const captureAndAnalyze = async (analysisMode = 'general') => {
    if (!videoRef.current || isAnalyzing || !isCameraActive) {
      if (!isCameraActive) {
        speak('Please start the camera first');
      }
      return;
    }

    setIsAnalyzing(true);
    speak('Analyzing...');

    try {
      // Capture frame from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });
      
      // Send to backend
      const result = await api.analyzeImage(blob, analysisMode);
      
      if (result.success) {
        setCurrentDescription(result.description);
        speak(result.description);
        
        // Add to history
        await api.addHistory(user.email, {
          type: 'vision',
          mode: analysisMode,
          result: result.description
        });
        
        // Reload history
        loadHistory(user.email);
      } else {
        speak('Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      speak('An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ==================== SPEECH FUNCTIONS ====================

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      speak('Recording started. Click stop when finished.');
    } catch (error) {
      console.error('Recording error:', error);
      speak('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      speak('Processing your speech...');
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const result = await api.transcribeAudio(audioBlob);
      
      if (result.success) {
        setCurrentDescription(result.text);
        speak(`You said: ${result.text}`);
        
        // Add to history
        await api.addHistory(user.email, {
          type: 'speech',
          mode: 'transcription',
          result: result.text
        });
        
        loadHistory(user.email);
      } else {
        speak('Transcription failed. Please try again.');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      speak('An error occurred during transcription.');
    }
  };

  // ==================== TEXT-TO-SPEECH ====================

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // ==================== VOICE COMMANDS ====================

  const handleVoiceCommand = (command) => {
    console.log('Voice command:', command);
    
    switch(command) {
      case 'startAnalysis':
        if (!isCameraActive) {
          startCamera();
        } else {
          captureAndAnalyze('general');
        }
        break;
        
      case 'stopAnalysis':
        stopCamera();
        break;
        
      case 'switchToVision':
        setMode('gesture');
        speak('Switched to vision mode');
        break;
        
      case 'switchToSpeech':
        setMode('speech');
        speak('Switched to speech mode');
        break;
        
      case 'readText':
        captureAndAnalyze('text');
        break;
        
      case 'detectHazards':
        captureAndAnalyze('hazard');
        break;
        
      case 'goToProfile':
        setView('profile');
        speak('Opening profile');
        break;
        
      case 'goHome':
        setView('home');
        speak('Going home');
        break;
        
      case 'help':
        const helpText = `Available commands: 
          Say start analysis to begin camera, 
          Say stop analysis to stop camera,
          Say read text for text recognition,
          Say detect hazards for safety check,
          Say switch to vision mode or speech mode to change modes,
          Say go to profile or go home to navigate`;
        speak(helpText);
        break;
    }
  };

  // ==================== KEYBOARD SHORTCUTS ====================

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (view !== 'home') return;
      
      switch(e.key) {
        case ' ':
          e.preventDefault();
          if (mode === 'gesture' && isCameraActive) {
            captureAndAnalyze('general');
          }
          break;
        case 'r':
          if (mode === 'gesture' && isCameraActive) {
            captureAndAnalyze('text');
          }
          break;
        case 'h':
          if (mode === 'gesture' && isCameraActive) {
            captureAndAnalyze('hazard');
          }
          break;
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [view, mode, isCameraActive]);

  // ==================== PROFILE FUNCTIONS ====================

  const handleUpdateProfile = async (formData) => {
    const result = await api.updateProfile(user.email, formData.name, formData.disabilities);
    if (result.success) {
      const updatedUser = result.user;
      setUser(updatedUser);
      localStorage.setItem('hand2voice_user', JSON.stringify(updatedUser));
      speak('Profile updated successfully');
    }
  };

  const handleClearHistory = async () => {
    const result = await api.clearHistory(user.email);
    if (result.success) {
      setHistory([]);
      speak('History cleared');
    }
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem('hand2voice_user');
    setUser(null);
    setView('home');
    speak('Logged out successfully');
  };

  // ==================== LOGIN/SIGNUP ====================

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Hand2Voice</h1>
          <LoginForm 
            onLogin={(userData) => {
              setUser(userData);
              localStorage.setItem('hand2voice_user', JSON.stringify(userData));
              speak(`Welcome back ${userData.name}`);
            }}
          />
        </div>
      </div>
    );
  }

  // ==================== MAIN APP ====================

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      padding: '1rem'
    }}>
      <Header 
        user={user} 
        onProfileClick={() => setView('profile')}
      />
      
      {view === 'home' && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <ModeSelector mode={mode} setMode={setMode} />
          
          {/* VISION MODE */}
          {mode === 'gesture' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              marginTop: '2rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ marginBottom: '1rem' }}>👁️ Vision Mode</h2>
              
              {/* Video Feed */}
              <div style={{ 
                position: 'relative', 
                marginTop: '1rem',
                display: 'inline-block'
              }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  style={{
                    width: '100%',
                    maxWidth: '640px',
                    borderRadius: '12px',
                    backgroundColor: '#000',
                    border: isCameraActive ? '3px solid #0ea5e9' : '3px solid #e5e7eb'
                  }}
                />
                {isAnalyzing && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    Analyzing...
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              
              {/* Controls */}
              <div style={{ 
                marginTop: '1.5rem', 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {!isCameraActive ? (
                  <button 
                    onClick={startCamera}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Start Camera
                  </button>
                ) : (
                  <>
                    <button onClick={() => captureAndAnalyze('general')}>Describe Scene</button>
                    <button onClick={() => captureAndAnalyze('text')}>Read Text</button>
                    <button onClick={() => captureAndAnalyze('hazard')}>Detect Hazards</button>
                    <button 
                      onClick={stopCamera}
                      style={{
                        backgroundColor: '#ef4444'
                      }}
                    >
                      Stop Camera
                    </button>
                  </>
                )}
              </div>
              
              {/* Keyboard Shortcuts */}
              <p style={{ 
                marginTop: '1rem', 
                fontSize: '0.875rem', 
                color: '#64748b' 
              }}>
                Keyboard: SPACE = Describe | R = Read Text | H = Detect Hazards
              </p>
              
              {/* Description */}
              {currentDescription && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  textAlign: 'left'
                }}>
                  <strong>Result:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{currentDescription}</p>
                </div>
              )}
            </div>
          )}
          
          {/* SPEECH MODE */}
          {mode === 'speech' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              marginTop: '2rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ marginBottom: '1rem' }}>🎤 Speech Mode</h2>
              
              <div style={{ marginTop: '1.5rem' }}>
                {!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording' ? (
                  <button 
                    onClick={startRecording}
                    style={{
                      padding: '1rem 2rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      width: '80px',
                      height: '80px'
                    }}
                  >
                    🎤
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    style={{
                      padding: '1rem 2rem',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      width: '80px',
                      height: '80px'
                    }}
                  >
                    ⏹️
                  </button>
                )}
              </div>
              
              {currentDescription && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  textAlign: 'left'
                }}>
                  <strong>Transcription:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{currentDescription}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {view === 'profile' && (
        <UserProfile
          user={user}
          history={history}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          onBackToHome={() => setView('home')}
          onClearHistory={handleClearHistory}
        />
      )}
      
      {/* Voice Control */}
      <VoiceControl onCommand={handleVoiceCommand} />
    </div>
  );
}

// Simple login form component
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await api.login(email, password);
    
    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}
        required
      />
      {error && (
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
      )}
      <button
        type="submit"
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#0ea5e9',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Login
      </button>
    </form>
  );
}