import React, { useState } from 'react';
import { User, Mail, Heart, LogOut, History, Edit2, Save, ArrowLeft, Trash2 } from 'lucide-react';

export default function UserProfile({ user, onLogout, onUpdateProfile, history, onBackToHome, onClearHistory }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    disabilities: user.disabilities || []
  });

  const disabilityOptions = [
    'Visual Impairment',
    'Hearing Impairment',
    'Motor Impairment',
    'Speech Impairment',
    'Cognitive Disability',
    'Other'
  ];

  const toggleDisability = (disability) => {
    setFormData(prev => ({
      ...prev,
      disabilities: prev.disabilities.includes(disability)
        ? prev.disabilities.filter(d => d !== disability)
        : [...prev.disabilities, disability]
    }));
  };

  const handleSave = async () => {
    await onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '2rem auto',
      padding: '2rem'
    }}>
      {/* Back Button */}
      <button
        onClick={onBackToHome}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'white',
          color: '#0077BB',
          border: '2px solid #0077BB',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem',
          marginBottom: '1.5rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#0077BB';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.color = '#0077BB';
        }}
      >
        <ArrowLeft size={20} />
        Back to Home
      </button>

      {/* Profile Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#E6F3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid #0077BB'
            }}>
              <User size={40} color="#0077BB" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    border: '2px solid #0077BB',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    marginBottom: '0.5rem'
                  }}
                />
              ) : (
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0 0 0.5rem 0'
                }}>
                  {user.name}
                </h2>
              )}
              <p style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#666',
                fontSize: '1.05rem',
                margin: 0
              }}>
                <Mail size={18} />
                {user.email}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isEditing ? (
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#009988',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                <Save size={18} />
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#0077BB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                <Edit2 size={18} />
                Edit
              </button>
            )}
            
            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#CC3311',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Accessibility Needs */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#F9F9F9',
          borderRadius: '12px',
          border: '2px solid #E0E0E0'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#333',
            marginBottom: '1rem'
          }}>
            <Heart size={22} color="#EE7733" />
            Accessibility Needs
          </h3>
          
          {isEditing ? (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {disabilityOptions.map((disability) => (
                <button
                  key={disability}
                  type="button"
                  onClick={() => toggleDisability(disability)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: formData.disabilities.includes(disability) 
                      ? '2px solid #0077BB' 
                      : '2px solid #E0E0E0',
                    backgroundColor: formData.disabilities.includes(disability) 
                      ? '#E6F3FF' 
                      : 'white',
                    color: formData.disabilities.includes(disability) 
                      ? '#0077BB' 
                      : '#666',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {disability}
                </button>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {user.disabilities && user.disabilities.length > 0 ? (
                user.disabilities.map((disability) => (
                  <span
                    key={disability}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#E6F3FF',
                      color: '#0077BB',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      border: '2px solid #0077BB'
                    }}
                  >
                    {disability}
                  </span>
                ))
              ) : (
                <p style={{ color: '#999', margin: 0 }}>No accessibility needs specified</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#333',
            margin: 0
          }}>
            <History size={24} color="#0077BB" />
            Recent Activity
          </h3>
          
          {history && history.length > 0 && (
            <button
              onClick={onClearHistory}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'white',
                color: '#CC3311',
                border: '2px solid #CC3311',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#CC3311';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#CC3311';
              }}
            >
              <Trash2 size={18} />
              Clear History
            </button>
          )}
        </div>

        {history && history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#F9F9F9',
                  borderRadius: '10px',
                  border: '2px solid #E0E0E0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    color: '#333',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {item.type === 'vision' ? '👁️ Vision Analysis' : '🎤 Speech Transcription'}
                    {item.mode && ` - ${item.mode}`}
                  </p>
                  {item.result && (
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      "{item.result.substring(0, 100)}{item.result.length > 100 ? '...' : ''}"
                    </p>
                  )}
                </div>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#999',
                  margin: 0,
                  whiteSpace: 'nowrap'
                }}>
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '1.05rem',
            padding: '2rem'
          }}>
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}