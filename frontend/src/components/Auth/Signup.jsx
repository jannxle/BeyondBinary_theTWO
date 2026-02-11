import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';

export default function Signup({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    disabilities: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const disabilityOptions = [
    'Visual Impairment',
    'Hearing Impairment',
    'Motor Impairment',
    'Speech Impairment',
    'Cognitive Disability',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:5003/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          disabilities: formData.disabilities
        })
      });

      const data = await response.json();

      if (data.success) {
        onSignup(data.user);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      setError('Connection error. Make sure the server is running on port 5004.');
      console.error('Error:', error);
    }
  };

  const toggleDisability = (disability) => {
    setFormData(prev => ({
      ...prev,
      disabilities: prev.disabilities.includes(disability)
        ? prev.disabilities.filter(d => d !== disability)
        : [...prev.disabilities, disability]
    }));
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '4rem auto',
      padding: '3rem',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '800',
        color: '#0077BB',
        marginBottom: '0.5rem',
        textAlign: 'center'
      }}>
        Create Account
      </h2>
      <p style={{
        textAlign: 'center',
        color: '#666',
        marginBottom: '2rem'
      }}>
        Join Echosight today
      </p>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FFE6E6',
          border: '2px solid #CC3311',
          borderRadius: '10px',
          color: '#CC3311',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          fontWeight: '600'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Full Name *
          </label>
          <div style={{ position: 'relative' }}>
            <User size={20} color="#999" style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1rem',
                border: '2px solid #E0E0E0',
                borderRadius: '10px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0077BB'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
            />
          </div>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Email Address *
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={20} color="#999" style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1rem',
                border: '2px solid #E0E0E0',
                borderRadius: '10px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0077BB'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
            />
          </div>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={20} color="#999" style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '1rem 3rem 1rem 3rem',
                fontSize: '1rem',
                border: '2px solid #E0E0E0',
                borderRadius: '10px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0077BB'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
            </button>
          </div>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Confirm Password *
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={20} color="#999" style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1rem',
                border: '2px solid #E0E0E0',
                borderRadius: '10px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0077BB'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
            />
          </div>
        </div>

        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#333'
          }}>
            <Heart size={18} color="#EE7733" />
            Accessibility Needs (Optional)
          </label>
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
        </div>

        <button
          type="submit"
          style={{
            padding: '1.25rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'white',
            backgroundColor: '#0077BB',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0, 119, 187, 0.3)',
            marginTop: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(0, 119, 187, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 119, 187, 0.3)';
          }}
        >
          Create Account
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: '2rem',
        color: '#666',
        fontSize: '0.95rem'
      }}>
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#0077BB',
            fontWeight: '700',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Sign In
        </button>
      </p>
    </div>
  );
}