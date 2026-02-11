import React, { useState, useEffect, useRef } from 'react';
import './VoiceControl.css';

/**
 * VoiceControl Component - NO LOOPS VERSION
 * Simplified to prevent any restart loops
 */
const VoiceControl = ({ 
  onStartCamera, 
  onStopCamera,
  onAnalyze, 
  onModeChange,
  currentMode = 'general',
  currentAppMode = 'gesture',
  userDisabilities = [],
  autoStart = false,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [detectedIntent, setDetectedIntent] = useState('');
  const [status, setStatus] = useState('Ready to listen');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // NEW: Track if we're speaking
  
  const recognitionRef = useRef(null);
  const hasAutoStartedRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const speakingTimeoutRef = useRef(null); // NEW: Track speaking timeout
  const isListeningRef = useRef(isListening); // NEW: Track current listening state
  const currentAppModeRef = useRef(currentAppMode); // NEW: Track current app mode

  // Keep refs updated
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    currentAppModeRef.current = currentAppMode;
  }, [currentAppMode]);

  // Check if user is visually impaired
  const isVisuallyImpaired = userDisabilities.includes('visual') || 
                             userDisabilities.includes('blind') || 
                             userDisabilities.includes('low vision');

  // KEYWORD-BASED INTENT DETECTION
  const detectIntent = (text) => {
    const lowerText = text.toLowerCase();
    
    // Camera Start
    if (lowerText.includes('camera') && (lowerText.includes('start') || lowerText.includes('open') || lowerText.includes('turn on') || lowerText.includes('show'))) {
      return { intent: 'START_CAMERA', confidence: 'high' };
    }

    // Camera Stop
    if (lowerText.includes('camera') && (lowerText.includes('stop') || lowerText.includes('close') || lowerText.includes('turn off') || lowerText.includes('off'))) {
      return { intent: 'STOP_CAMERA', confidence: 'high' };
    }

    // Analyze
    if (lowerText.includes('analyze') || lowerText.includes('look') || lowerText.includes('see') || lowerText.includes('what') || lowerText.includes('check') || lowerText.includes('scan') || lowerText.includes('describe') || lowerText.includes('tell me')) {
      return { intent: 'ANALYZE', confidence: 'high' };
    }

    // Hazard Detection
    if (lowerText.includes('danger') || lowerText.includes('hazard') || lowerText.includes('safe') || lowerText.includes('obstacle')) {
      return { intent: 'HAZARD_MODE', confidence: 'high' };
    }

    // Text Reading
    if (lowerText.includes('read') || lowerText.includes('text') || lowerText.includes('sign') || lowerText.includes('label')) {
      return { intent: 'TEXT_MODE', confidence: 'high' };
    }

    // General View
    if (lowerText.includes('general') || lowerText.includes('normal')) {
      return { intent: 'GENERAL_MODE', confidence: 'high' };
    }

    // Help
    if (lowerText.includes('help') || lowerText.includes('command')) {
      return { intent: 'HELP', confidence: 'high' };
    }

    // Stop Listening
    if ((lowerText.includes('stop') && lowerText.includes('listen')) || lowerText.includes('quiet')) {
      return { intent: 'STOP_LISTENING', confidence: 'high' };
    }

    return { intent: 'UNKNOWN', confidence: 'low' };
  };

  // Auto-start for visually impaired users
  useEffect(() => {
    if (isVisuallyImpaired && autoStart && !hasAutoStartedRef.current && currentAppMode === 'gesture') {
      console.log('🔊 Auto-starting voice control');
      setTimeout(() => {
        setIsListening(true);
        hasAutoStartedRef.current = true;
      }, 2000);
    }
  }, [isVisuallyImpaired, autoStart, currentAppMode]);

  // Auto-stop when switching to Speech mode
  useEffect(() => {
    if (currentAppMode === 'speech' && isListening) {
      console.log('⚠️ Switching to Speech mode - stopping VoiceControl');
      setIsListening(false);
      setStatus('Voice control paused');
    }
  }, [currentAppMode, isListening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // CHANGED: Don't auto-continue
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript.trim();
        
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          console.log('🎤 Heard:', transcriptText);
          const result = detectIntent(transcriptText);
          console.log('🧠 Detected:', result.intent);
          
          if (result.confidence === 'high') {
            setDetectedIntent(result.intent);
            processIntent(result.intent, transcriptText);
          } else {
            setStatus(`Didn't understand: "${transcriptText}"`);
          }
          
          // Clear transcript after processing
          setTimeout(() => setTranscript(''), 1000);
        }
      };

      recognition.onerror = (event) => {
        console.error('Error:', event.error);
        
        if (event.error === 'not-allowed') {
          setStatus('Microphone access denied');
          setShowPermissionModal(true);
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Just restart, don't show error
          console.log('No speech detected');
        }
      };

      recognition.onend = () => {
        console.log('Recognition ended, isSpeaking:', isSpeaking);
        
        // Clear any existing timeout
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        // IMPORTANT: Don't restart if we're currently speaking (prevents loop!)
        if (isSpeaking) {
          console.log('Not restarting - currently speaking');
          return;
        }
        
        // Only restart if still listening and in gesture mode
        if (isListening && currentAppMode === 'gesture') {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isListening && currentAppMode === 'gesture' && !isSpeaking) {
              try {
                recognitionRef.current.start();
                console.log('Restarted listening');
              } catch (e) {
                console.error('Restart error:', e);
              }
            }
          }, 1000); // Long delay between restarts
        }
      };

      recognition.onstart = () => {
        console.log('Listening started');
        setStatus('Listening...');
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setStatus('Not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, [isListening, currentAppMode, isSpeaking]);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (currentAppMode === 'speech') {
      if (isListening) setIsListening(false);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.start();
        console.log('▶️ Started');
      } catch (e) {
        console.error('Start error:', e);
      }
    } else {
      recognitionRef.current.stop();
      setStatus('Stopped');
      setTranscript('');
      console.log('⏹️ Stopped');
    }
  }, [isListening, currentAppMode]);

  const processIntent = (intent, originalText) => {
    setLastCommand(originalText);
    
    switch(intent) {
      case 'START_CAMERA':
        handleStartCamera();
        break;
      case 'STOP_CAMERA':
        handleStopCamera();
        break;
      case 'ANALYZE':
        handleAnalyze();
        break;
      case 'GENERAL_MODE':
        handleModeChange('general');
        break;
      case 'TEXT_MODE':
        handleModeChange('text');
        break;
      case 'HAZARD_MODE':
        handleModeChange('hazards');
        break;
      case 'HELP':
        handleHelp();
        break;
      case 'STOP_LISTENING':
        setIsListening(false);
        break;
      default:
        setStatus(`Didn't understand`);
    }
  };

  const handleStartCamera = () => {
    setStatus('Starting camera...');
    speak('Opening camera');
    if (onStartCamera) onStartCamera();
  };

  const handleStopCamera = () => {
    setStatus('Stopping camera...');
    speak('Closing camera');
    if (onStopCamera) onStopCamera();
  };

  const handleAnalyze = () => {
    setStatus('Analyzing...');
    speak('Analyzing image');
    if (onAnalyze) onAnalyze();
  };

  const handleModeChange = (mode) => {
    const modeNames = { 
      general: 'general view', 
      text: 'text reading', 
      hazards: 'hazard detection' 
    };
    setStatus(`Mode: ${modeNames[mode]}`);
    speak(`Switched to ${modeNames[mode]} mode`);
    if (onModeChange) onModeChange(mode);
  };

  const handleHelp = () => {
    setStatus('Speak naturally: "show camera", "what do you see", "check dangers"');
    speak('Speak naturally. Say show camera, what do you see, or check dangers.');
  };

  // Text-to-speech with loop prevention
  const speak = (text) => {
    if (!text || isSpeaking) {
      console.log('Skipping speech - already speaking');
      return;
    }

    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      // Cancel any existing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.volume = 1;
      
      utterance.onend = () => {
        console.log('Speech ended');
        // Clear the speaking flag after a delay
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
        }
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
          
          // CRITICAL FIX: Restart recognition after speaking if we should still be listening
          // Use refs to get current values (not closure values)
          if (isListeningRef.current && currentAppModeRef.current === 'gesture' && recognitionRef.current) {
            console.log('Restarting recognition after speech');
            try {
              recognitionRef.current.start();
            } catch (e) {
              if (e.name !== 'InvalidStateError') {
                console.error('Error restarting after speech:', e);
              }
            }
          }
        }, 500); // Wait 500ms before restarting
      };
      
      utterance.onerror = () => {
        console.log('Speech error');
        setIsSpeaking(false);
        
        // Try to restart even on error (use refs)
        if (isListeningRef.current && currentAppModeRef.current === 'gesture' && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting after speech error:', e);
          }
        }
      };
      
      window.speechSynthesis.speak(utterance);
      console.log('Speaking:', text);
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      alert('Not supported. Use Chrome, Edge, or Safari.');
      return;
    }
    
    if (currentAppMode === 'speech') {
      alert('Switch to Vision Mode first');
      return;
    }
    
    setIsListening(!isListening);
  };

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setShowPermissionModal(false);
      setIsListening(true);
    } catch (error) {
      alert('Unable to access microphone');
    }
  };

  if (!isSupported) {
    return (
      <div className={`voice-control-error ${className}`}>
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h3>Voice Control Not Available</h3>
          <p>Use Chrome, Edge, or Safari</p>
        </div>
      </div>
    );
  }

  if (currentAppMode === 'speech') {
    return (
      <div className={`voice-control-container ${className}`} style={{ opacity: 0.6 }}>
        <div className="voice-control-header">
          <h3 className="voice-control-title">
            <span className="title-icon">🎤</span>
            Voice Control (Paused)
          </h3>
        </div>
        <div className="voice-status" style={{ backgroundColor: '#fff3cd', borderLeftColor: '#ffc107' }}>
          <strong>⚠️ Paused in Speech Mode</strong>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`voice-control-container ${className}`}>
        <div className="voice-control-header">
          <h3 className="voice-control-title">
            <span className="title-icon">🎤</span>
            Voice Control
            {isSpeaking && <span style={{ marginLeft: '10px', fontSize: '0.8em', color: '#28a745' }}>🔊 Speaking...</span>}
            {isVisuallyImpaired && <span style={{ marginLeft: '10px', fontSize: '0.7em', color: '#28a745' }}>♿</span>}
          </h3>
          <button 
            onClick={toggleListening}
            className={`voice-toggle-btn ${isListening ? 'active' : ''}`}
          >
            {isListening ? '⏸️ Stop' : '▶️ Start'}
          </button>
        </div>

        <div className={`voice-status ${isListening ? 'listening' : ''}`}>
          <strong>Status:</strong> {status}
        </div>

        {transcript && isListening && !isSpeaking && (
          <div className="voice-transcript">
            <strong>You said:</strong> "{transcript}"
          </div>
        )}

        {lastCommand && (
          <div className="voice-last-command">
            <strong>Last:</strong> {lastCommand}
          </div>
        )}

        <details className="voice-help-section">
          <summary className="voice-help-summary">
            <span className="help-icon">💡</span>
            Commands
          </summary>
          <div className="command-list">
            <div className="command-group">
              <p style={{ marginBottom: '10px' }}>Speak naturally:</p>
              <ul>
                <li>"Show camera" - start camera</li>
                <li>"What do you see" - analyze</li>
                <li>"Check dangers" - hazard mode</li>
                <li>"Read text" - text mode</li>
                <li>"Stop camera" - stop camera</li>
              </ul>
            </div>
          </div>
        </details>

        <div className="accessibility-notice">
          <span className="notice-icon">♿</span>
          <small>Speak naturally - no exact commands needed</small>
        </div>
      </div>

      {isListening && (
        <div className="listening-indicator">
          <span className="pulse-dot"></span>
          Listening
          {transcript && <span className="transcript"> - "{transcript}"</span>}
        </div>
      )}

      {showPermissionModal && (
        <div className="mic-permission-modal">
          <div className="mic-permission-content">
            <div className="mic-permission-icon">🎤</div>
            <h2 className="mic-permission-title">Microphone Access Required</h2>
            <p className="mic-permission-text">
              EchoSight needs microphone access for voice control.
            </p>
            <div className="mic-permission-buttons">
              <button onClick={requestMicrophonePermission} className="btn-primary">
                Enable Microphone
              </button>
              <button onClick={() => setShowPermissionModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceControl;