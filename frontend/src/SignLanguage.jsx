import React, { useState, useRef } from 'react';
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
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // ========================================
  // VIDEO/GESTURE FUNCTIONS (Keep existing)
  // ========================================
  
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

  // ========================================
  // NEW: WHISPER SPEECH-TO-TEXT FUNCTIONS
  // ========================================

  // Send audio to backend for transcription
  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    try {
      console.log('Sending audio to backend...');
      const response = await fetch('http://localhost:5001/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Transcription received:', data.text);
        setRecognizedText(data.text);
        setTranscript(prev => [...prev, { 
          type: 'speech', 
          text: data.text, 
          time: new Date() 
        }]);
      } else {
        console.error('Transcription failed:', data.error);
        alert('Transcription failed: ' + data.error);
      }
    } catch (err) {
      console.error('Error calling transcription API:', err);
      alert('Could not connect to transcription server. Make sure Flask is running!');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start recording audio from microphone
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Recording stopped, audio size:', audioBlob.size, 'bytes');
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      console.log('🎤 Recording started...');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access microphone. Please grant permission.');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      console.log('⏹️ Recording stopped. Sending to Whisper...');
    }
  };

  // Toggle recording on/off
  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ========================================
  // TEXT-TO-SPEECH (Keep existing)
  // ========================================
  
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // ========================================
  // RENDER
  // ========================================

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
                isTranscribing={isTranscribing}
              />
            )}
          </div>

          {/* Right Column - Output */}
          <OutputDisplay
            mode={mode}
            gestureDetected={gestureDetected}
            recognizedText={recognizedText}
            speakText={speakText}
            isTranscribing={isTranscribing}
          />
        </div>
      </div>
    </div>
  );
}