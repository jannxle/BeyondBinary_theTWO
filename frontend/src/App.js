import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import GestureInput from './components/GestureInput';
import SpeechInput from './components/SpeechInput';
import OutputDisplay from './components/OutputDisplay';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import UserProfile from './components/Profile/UserProfile';
import EmergencySOS from './components/EmergencySOS';
import AccessibilitySettings from './components/AccessibilitySettings';
import VoiceControl from './components/VoiceControl'; 
import { api } from './services/api'
import { User } from 'lucide-react';
import './App.css';

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [showProfile, setShowProfile] = useState(false);

  // Accessibility settings state
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    textSize: 'medium',
    contrastMode: 'normal',
    speechSpeed: 1.0
  });
  const [showSettings, setShowSettings] = useState(false);

  // Mode state
  const [mode, setMode] = useState('gesture');
  
  // Vision/Gesture mode state
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Speech mode state
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // History state
  const [history, setHistory] = useState([]);

  // ========== ADD THIS: Voice Control State ==========
  const [visionAnalysisMode, setVisionAnalysisMode] = useState('general'); // 'general', 'text', 'hazards'

  // Load history when user logs in
  useEffect(() => {
    if (user && user.email) {
      loadHistory();
    }
  }, [user]);

  // Load history from server
  const loadHistory = async () => {
    if (!user || !user.email) return;

    try {
      const response = await fetch('http://localhost:5004/api/history/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Add history entry to server
  const addHistoryEntry = async (entry) => {
    if (!user || !user.email) return;

    try {
      const response = await fetch('http://localhost:5004/api/history/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email,
          entry: entry
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error adding history:', error);
      // Fallback: add to local state
      setHistory(prev => [entry, ...prev]);
    }
  };

  // Clear history
  const clearHistory = async () => {
    if (!user || !user.email) return;

    if (!window.confirm('Are you sure you want to clear all history?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5004/api/history/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();
      
      if (data.success) {
        setHistory([]);
        alert('History cleared successfully!');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history');
    }
  };

  // Get text size scale
  const getTextScale = () => {
    const scales = {
      small: 0.9,
      medium: 1.0,
      large: 1.2,
      xlarge: 1.4
    };
    return scales[accessibilitySettings.textSize] || 1.0;
  };

  // Get contrast colors
  const getContrastColors = () => {
    const modes = {
      normal: { bg: '#FFFFFF', text: '#333333', primary: '#0077BB' },
      'high-black': { bg: '#000000', text: '#FFFFFF', primary: '#00BFFF' },
      'high-yellow': { bg: '#000000', text: '#FFFF00', primary: '#FFFF00' },
      inverted: { bg: '#1a1a1a', text: '#FFFFFF', primary: '#00BFFF' }
    };
    return modes[accessibilitySettings.contrastMode] || modes.normal;
  };

  // Apply accessibility settings to body
  useEffect(() => {
    const colors = getContrastColors();
    const scale = getTextScale();
    
    document.body.style.fontSize = `${scale}rem`;
    // Only apply background color for high contrast modes, not normal mode
    if (accessibilitySettings.contrastMode !== 'normal') {
      document.body.style.backgroundColor = colors.bg;
    } else {
      document.body.style.backgroundColor = '#ffffff';
    }
    document.body.style.color = colors.text;
  }, [accessibilitySettings]);

  // ========== ADD THIS: Voice Control Handler for Camera ==========
  const handleVoiceStartCamera = async () => {
    // This starts the camera (same as toggleVideo when video is off)
    if (!isVideoActive) {
      await toggleVideo();
    }
  };

  // ========== ADD THIS: Voice Control Handler for Analyze ==========
  const handleVoiceAnalyze = async () => {
    // This triggers analysis with the current vision mode
    if (isVideoActive) {
      await captureAndAnalyze(visionAnalysisMode);
    } else {
      alert('Please start the camera first by saying "start camera"');
    }
  };

  // ========== ADD THIS: Voice Control Handler for Mode Change ==========
  const handleVoiceModeChange = (mode) => {
    setVisionAnalysisMode(mode);
    console.log('Vision analysis mode changed to:', mode);
  };

  // Toggle video for vision mode
  const toggleVideo = async () => {
    if (isVideoActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsVideoActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setIsVideoActive(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access camera');
      }
    }
  };

  // Capture and analyze image
  const captureAndAnalyze = async (visionMode) => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    setAnalysisResult('');

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'capture.jpg');
        formData.append('mode', visionMode);

        const response = await fetch('http://localhost:5004/api/analyze', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        if (data.success) {
          setAnalysisResult(data.description);
          
          // Add to history (server will handle timestamp)
          await addHistoryEntry({
            type: 'vision',
            mode: visionMode,
            result: data.description
          });
        } else {
          setAnalysisResult('Analysis failed: ' + data.error);
        }
        
        setIsAnalyzing(false);
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAnalysisResult('Error: ' + error.message);
      setIsAnalyzing(false);
    }
  };

  // Toggle speech listening
  const toggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          setIsTranscribing(true);
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob);

          try {
            const response = await fetch('http://localhost:5004/api/transcribe', {
              method: 'POST',
              body: formData
            });

            const data = await response.json();
            
            if (data.success) {
              setRecognizedText(data.text);
              
              // Add to history
              await addHistoryEntry({
                type: 'speech',
                result: data.text
              });
            } else {
              setRecognizedText('Transcription failed: ' + data.error);
            }
          } catch (error) {
            console.error('Error transcribing:', error);
            setRecognizedText('Error: ' + error.message);
          } finally {
            setIsTranscribing(false);
          }

          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone');
      }
    }
  };

  // Text-to-speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = accessibilitySettings.speechSpeed;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShowProfile(false);
    setHistory([]);
  };

  const handleUpdateProfile = async (updatedData) => {
    setUser({ ...user, ...updatedData });
  };

  const handleBackToHome = () => {
    setShowProfile(false);
  };

  const colors = getContrastColors();

  // If user is not logged in, show auth screens
  if (!user) {
    return (
      <div className="app-container">
        {authView === 'login' ? (
          <Login 
            onLogin={setUser} 
            onSwitchToSignup={() => setAuthView('signup')} 
          />
        ) : (
          <Signup 
            onSignup={setUser} 
            onSwitchToLogin={() => setAuthView('login')} 
          />
        )}
      </div>
    );
  }

  // If showing profile
  if (showProfile) {
    return (
      <div className="app-container">
        <UserProfile 
          user={user} 
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          onBackToHome={handleBackToHome}
          history={history}
          onClearHistory={clearHistory}
        />
      </div>
    );
  }

  // Main app (logged in)
  return (
    <div className="app-container">
      {/* Emergency SOS Button - Always visible */}
      <EmergencySOS user={user} />

      {/* Accessibility Settings */}
      <AccessibilitySettings
        settings={accessibilitySettings}
        onSettingsChange={setAccessibilitySettings}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        {/* User info in header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <Header contrastColors={colors} />
          <button
            onClick={() => setShowProfile(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: colors.primary,
              color: accessibilitySettings.contrastMode === 'normal' ? 'white' : colors.bg,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            <User size={20} />
            {user.name}
          </button>
        </div>

        {/* ========== ADD THIS: VoiceControl Component ========== */}
        <VoiceControl
          onStartCamera={handleVoiceStartCamera}
          onAnalyze={handleVoiceAnalyze}
          onModeChange={handleVoiceModeChange}
          currentMode={visionAnalysisMode}
        />
        
        <ModeSelector mode={mode} setMode={setMode} contrastColors={colors} />

        <div style={{ marginTop: '2rem' }}>
          {mode === 'gesture' ? (
            <GestureInput
              videoRef={videoRef}
              canvasRef={canvasRef}
              isVideoActive={isVideoActive}
              toggleVideo={toggleVideo}
              onCapture={captureAndAnalyze}
              analysisResult={analysisResult}
              isAnalyzing={isAnalyzing}
              speechSpeed={accessibilitySettings.speechSpeed}
            />
          ) : (
            <>
              <SpeechInput
                isListening={isListening}
                toggleListening={toggleListening}
                isTranscribing={isTranscribing}
              />
              <OutputDisplay
                mode={mode}
                gestureDetected={null}
                recognizedText={recognizedText}
                speakText={speakText}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;