import React, { useState, useEffect, useRef } from 'react';
import './VoiceControl.css';  // ← CORRECT CSS IMPORT (same folder)

/**
 * VoiceControl Component
 * Provides voice recognition control for Hand2Voice application
 * Designed for accessibility and ease of use for visually impaired users
 */
const VoiceControl = ({ 
  onStartCamera, 
  onAnalyze, 
  onModeChange,
  currentMode = 'general',
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [status, setStatus] = useState('Ready to listen');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Voice command mappings
  const COMMANDS = {
    // Camera control
    startCamera: ['start camera', 'open camera', 'activate camera', 'turn on camera', 'camera on'],
    analyze: ['analyze', 'analyze image', 'check image', 'what do you see', 'describe', 'scan'],
    
    // Mode selection
    generalMode: ['general view', 'general mode', 'switch to general', 'normal mode'],
    textMode: ['read text', 'text mode', 'ocr mode', 'switch to text', 'text reading'],
    hazardMode: ['detect hazards', 'hazard mode', 'safety mode', 'check hazards', 'find dangers', 'danger detection'],
    
    // Utility
    help: ['help', 'what can you do', 'commands', 'show commands'],
    stop: ['stop listening', 'stop', 'cancel', 'turn off']
  };

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Handle speech recognition results
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript.toLowerCase().trim();
        
        setTranscript(transcriptText);

        // Only process final results
        if (event.results[current].isFinal) {
          processCommand(transcriptText);
        }
      };

      // Handle errors
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          setStatus('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setStatus('Microphone access denied');
          setShowPermissionModal(true);
          setIsListening(false);
        } else if (event.error === 'network') {
          setStatus('Network error. Please check your connection.');
        } else {
          setStatus(`Error: ${event.error}`);
        }
      };

      // Handle recognition end
      recognition.onend = () => {
        if (isListening && recognitionRef.current) {
          // Restart if still supposed to be listening
          try {
            recognition.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }
      };

      // Handle recognition start
      recognition.onstart = () => {
        setStatus('Listening...');
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setStatus('Voice recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Start/stop listening based on isListening state
  useEffect(() => {
    if (!recognitionRef.current) return;

    try {
      if (isListening) {
        recognitionRef.current.start();
        speak('Voice control activated. Say "help" for available commands.');
      } else {
        recognitionRef.current.stop();
        setStatus('Voice control stopped');
        setTranscript('');
      }
    } catch (e) {
      console.error('Error controlling recognition:', e);
    }
  }, [isListening]);

  /**
   * Process recognized voice commands
   */
  const processCommand = (command) => {
    setLastCommand(command);
    
    // Check for camera start commands
    if (matchesCommand(command, COMMANDS.startCamera)) {
      handleStartCamera();
    }
    // Check for analyze commands
    else if (matchesCommand(command, COMMANDS.analyze)) {
      handleAnalyze();
    }
    // Check for mode changes
    else if (matchesCommand(command, COMMANDS.generalMode)) {
      handleModeChange('general');
    }
    else if (matchesCommand(command, COMMANDS.textMode)) {
      handleModeChange('text');
    }
    else if (matchesCommand(command, COMMANDS.hazardMode)) {
      handleModeChange('hazards');
    }
    // Utility commands
    else if (matchesCommand(command, COMMANDS.help)) {
      handleHelp();
    }
    else if (matchesCommand(command, COMMANDS.stop)) {
      setIsListening(false);
    }
    else {
      setStatus(`Command not recognized: "${command}"`);
      speak('Command not recognized. Say "help" for available commands.');
    }
  };

  /**
   * Check if command matches any of the command patterns
   */
  const matchesCommand = (input, patterns) => {
    return patterns.some(pattern => input.includes(pattern));
  };

  /**
   * Handle camera start command
   */
  const handleStartCamera = () => {
    setStatus('Starting camera...');
    speak('Starting camera');
    
    if (onStartCamera) {
      onStartCamera();
    }
    
    // Update status after delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setStatus('Camera active. Say "analyze" to analyze the image.');
    }, 2000);
  };

  /**
   * Handle analyze command
   */
  const handleAnalyze = () => {
    const modeNames = {
      general: 'general view',
      text: 'text reading',
      hazards: 'hazard detection'
    };
    
    setStatus(`Analyzing in ${modeNames[currentMode]} mode...`);
    speak(`Analyzing image in ${modeNames[currentMode]} mode`);
    
    if (onAnalyze) {
      onAnalyze();
    }
  };

  /**
   * Handle mode change commands
   */
  const handleModeChange = (mode) => {
    const modeNames = {
      general: 'general view',
      text: 'text reading',
      hazards: 'hazard detection'
    };
    
    setStatus(`Switching to ${modeNames[mode]} mode`);
    speak(`Switched to ${modeNames[mode]} mode`);
    
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  /**
   * Handle help command
   */
  const handleHelp = () => {
    const helpMessage = `Available voice commands: 
      Say "start camera" to activate the camera. 
      Say "analyze" to analyze the current image. 
      Say "detect hazards" for hazard detection mode. 
      Say "read text" for text reading mode. 
      Say "general view" for general analysis mode.
      Say "stop listening" to deactivate voice control.`;
    
    setStatus('Help requested');
    speak(helpMessage);
  };

  /**
   * Text-to-speech feedback
   */
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      
      window.speechSynthesis.speak(utterance);
    }
  };

  /**
   * Toggle voice recognition on/off
   */
  const toggleListening = () => {
    if (!isSupported) {
      alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    setIsListening(!isListening);
  };

  /**
   * Request microphone permission
   */
  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setShowPermissionModal(false);
      setIsListening(true);
    } catch (error) {
      alert('Unable to access microphone. Please check your browser settings and grant microphone permission.');
    }
  };

  if (!isSupported) {
    return (
      <div className={`voice-control-error ${className}`}>
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h3>Voice Control Not Available</h3>
          <p>Voice recognition is not supported in this browser.</p>
          <p>Please use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Safari</strong> for voice control features.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`voice-control-container ${className}`}>
        {/* Header with toggle button */}
        <div className="voice-control-header">
          <h3 className="voice-control-title">
            <span className="title-icon">🎤</span>
            Voice Control
          </h3>
          <button 
            onClick={toggleListening}
            className={`voice-toggle-btn ${isListening ? 'active' : ''}`}
            aria-label={isListening ? 'Stop voice control' : 'Start voice control'}
            aria-pressed={isListening}
          >
            {isListening ? (
              <>
                <span>⏸️</span> Stop Listening
              </>
            ) : (
              <>
                <span>▶️</span> Start Listening
              </>
            )}
          </button>
        </div>

        {/* Status Display */}
        <div className={`voice-status ${isListening ? 'listening' : ''}`}>
          <strong>Status:</strong> {status}
        </div>

        {/* Live Transcript */}
        {transcript && isListening && (
          <div className="voice-transcript">
            <strong>You're saying:</strong> "{transcript}"
          </div>
        )}

        {/* Last Command */}
        {lastCommand && (
          <div className="voice-last-command">
            <strong>Last command:</strong> {lastCommand}
          </div>
        )}

        {/* Command Reference */}
        <details className="voice-help-section">
          <summary className="voice-help-summary">
            <span className="help-icon">💡</span>
            Voice Commands Reference
          </summary>
          <div className="command-list">
            <div className="command-group">
              <h4 className="command-group-title">📷 Camera Control</h4>
              <ul>
                <li><code>"start camera"</code> - Activate the camera</li>
                <li><code>"analyze"</code> - Analyze current image</li>
              </ul>
            </div>
            <div className="command-group">
              <h4 className="command-group-title">🔍 Analysis Modes</h4>
              <ul>
                <li><code>"general view"</code> - Switch to general analysis</li>
                <li><code>"read text"</code> - Switch to text reading (OCR)</li>
                <li><code>"detect hazards"</code> - Switch to hazard detection</li>
              </ul>
            </div>
            <div className="command-group">
              <h4 className="command-group-title">⚙️ Utility</h4>
              <ul>
                <li><code>"help"</code> - Hear available commands</li>
                <li><code>"stop listening"</code> - Stop voice control</li>
              </ul>
            </div>
          </div>
        </details>

        {/* Accessibility Notice */}
        <div className="accessibility-notice" role="complementary">
          <span className="notice-icon">♿</span>
          <small>Voice control is fully accessible with screen readers and keyboard navigation</small>
        </div>
      </div>

      {/* Floating Voice Button (for mobile/minimal UI) */}
      {isListening && (
        <div className="listening-indicator" role="status" aria-live="polite">
          <span className="pulse-dot"></span>
          Listening
          {transcript && <span className="transcript"> - "{transcript}"</span>}
        </div>
      )}

      {/* Microphone Permission Modal */}
      {showPermissionModal && (
        <div className="mic-permission-modal" role="dialog" aria-labelledby="permission-title">
          <div className="mic-permission-content">
            <div className="mic-permission-icon">🎤</div>
            <h2 id="permission-title" className="mic-permission-title">Microphone Access Required</h2>
            <p className="mic-permission-text">
              Hand2Voice needs access to your microphone to enable voice control.
              This allows you to control the camera and analysis features hands-free.
            </p>
            <div className="mic-permission-buttons">
              <button 
                onClick={requestMicrophonePermission}
                className="btn-primary"
              >
                Enable Microphone
              </button>
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {status}
      </div>
    </>
  );
};

export default VoiceControl;