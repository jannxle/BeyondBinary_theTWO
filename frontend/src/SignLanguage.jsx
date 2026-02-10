import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import GestureInput from './components/GestureInput';
import SpeechInput from './components/SpeechInput';
import OutputDisplay from './components/OutputDisplay';
import './App.css';

export default function SignLanguage() {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [gestureDetected, setGestureDetected] = useState('');
  const [mode, setMode] = useState('gesture');
  const [transcript, setTranscript] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setRecognizedText(finalTranscript);
          setTranscript(prev => [...prev, { type: 'speech', text: finalTranscript, time: new Date() }]);
        } else {
          setRecognizedText(interimTranscript);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start/stop video stream
  const toggleVideo = async () => {
    if (isVideoActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsVideoActive(false);
      setGestureDetected('');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setIsVideoActive(true);
        startGestureDetection();
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please grant permission.');
      }
    }
  };

  // Placeholder for gesture detection
  const startGestureDetection = () => {
    const gestures = ['Hello', 'Thank You', 'Help', 'Yes', 'No'];
    const interval = setInterval(() => {
      if (isVideoActive) {
        const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
        setGestureDetected(randomGesture);
        setTranscript(prev => [...prev, { type: 'gesture', text: randomGesture, time: new Date() }]);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Text-to-speech
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <Header />
        
        <ModeSelector mode={mode} setMode={setMode} />

        <div className="main-grid">
          {/* Left Column - Input */}
          <div className="input-card">
            {mode === 'gesture' ? (
              <GestureInput
                videoRef={videoRef}
                canvasRef={canvasRef}
                isVideoActive={isVideoActive}
                toggleVideo={toggleVideo}
              />
            ) : (
              <SpeechInput
                isListening={isListening}
                toggleListening={toggleListening}
              />
            )}
          </div>

          {/* Right Column - Output */}
          <OutputDisplay
            mode={mode}
            gestureDetected={gestureDetected}
            recognizedText={recognizedText}
            speakText={speakText}
          />
        </div>
      </div>
    </div>
  );
}