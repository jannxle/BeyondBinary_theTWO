import React, { useState } from 'react';
import { AlertTriangle, Phone, X, MapPin, MessageSquare } from 'lucide-react';

export default function EmergencySOS({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [emergencyContacts] = useState([
    { name: 'Emergency Services', number: '911', isPrimary: true },
    { name: 'Family Contact', number: user?.emergencyContact || 'Not set', isPrimary: false }
  ]);

  const sendEmergencyAlert = (contact) => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude},${position.coords.longitude}`;
          const mapsUrl = `https://www.google.com/maps?q=${location}`;
          
          // In a real app, this would send SMS/call
          alert(`Emergency alert sent to ${contact.name}\nLocation: ${mapsUrl}\n\nIn production, this would:\n- Call ${contact.number}\n- Send SMS with location\n- Alert emergency contacts`);
          
          // Speak alert
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`Emergency alert sent to ${contact.name}`);
            window.speechSynthesis.speak(utterance);
          }
        },
        (error) => {
          alert(`Calling ${contact.number}\n\n(In production, would place actual call)`);
        }
      );
    } else {
      alert(`Calling ${contact.number}\n\n(In production, would place actual call)`);
    }
    
    setShowModal(false);
  };

  const quickPhrases = [
    { text: "I need help", icon: MessageSquare },
    { text: "I've fallen and can't get up", icon: AlertTriangle },
    { text: "Send someone to my location", icon: MapPin },
    { text: "Call emergency services", icon: Phone }
  ];

  const speakPhrase = (phrase) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating SOS Button - Always visible */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#CC3311',
          color: 'white',
          border: '4px solid white',
          boxShadow: '0 4px 20px rgba(204, 51, 17, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: '700',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          animation: 'pulse-sos 2s ease-in-out infinite'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 30px rgba(204, 51, 17, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(204, 51, 17, 0.5)';
        }}
      >
        <AlertTriangle size={28} strokeWidth={2.5} />
        <span style={{ marginTop: '2px' }}>SOS</span>
      </button>

      {/* Emergency Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} color="#666" />
            </button>

            {/* Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#FFE6E6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: '4px solid #CC3311'
              }}>
                <AlertTriangle size={40} color="#CC3311" />
              </div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#CC3311',
                margin: '0 0 0.5rem 0'
              }}>
                Emergency SOS
              </h2>
              <p style={{
                color: '#666',
                fontSize: '1rem'
              }}>
                Get help quickly
              </p>
            </div>

            {/* Emergency Contacts */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#333',
                marginBottom: '1rem'
              }}>
                Call Emergency Contact
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {emergencyContacts.map((contact, index) => (
                  <button
                    key={index}
                    onClick={() => sendEmergencyAlert(contact)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.25rem',
                      backgroundColor: contact.isPrimary ? '#CC3311' : '#0077BB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                  >
                    <Phone size={24} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div>{contact.name}</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{contact.number}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Phrases */}
            <div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#333',
                marginBottom: '1rem'
              }}>
                Quick Phrases (Speak Aloud)
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem'
              }}>
                {quickPhrases.map((phrase, index) => {
                  const Icon = phrase.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => speakPhrase(phrase.text)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        backgroundColor: '#F5F5F5',
                        border: '2px solid #E0E0E0',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#333',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#E6F3FF';
                        e.target.style.borderColor = '#0077BB';
                        e.target.style.color = '#0077BB';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#F5F5F5';
                        e.target.style.borderColor = '#E0E0E0';
                        e.target.style.color = '#333';
                      }}
                    >
                      <Icon size={24} />
                      {phrase.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-sos {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(204, 51, 17, 0.5);
          }
          50% {
            box-shadow: 0 4px 30px rgba(204, 51, 17, 0.8);
          }
        }

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