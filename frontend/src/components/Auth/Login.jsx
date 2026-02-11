import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5004/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Cannot connect to server. Make sure the backend is running on port 5004.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '450px',
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
        EchoSight
      </h2>
      <p style={{
        textAlign: 'center',
        color: '#666',
        marginBottom: '2rem'
      }}>
        Turning your gestures into words instantly!
      </p>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FFE6E6',
          border: '2px solidrgb(230, 42, 0)',
          borderRadius: '10px',
          color: '#CC3311',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          fontWeight: '600'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <User size={20} color="#999" style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1rem',
                border: '2px solid #E0E0E0',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border 0.2s',
                opacity: loading ? 0.6 : 1
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
            Password
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 3rem 1rem 3rem',
                fontSize: '1rem',
                border: '2px solid #E0E0E0',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = '#0077BB'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '0.25rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '1.25rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'white',
            backgroundColor: loading ? '#999' : '#0077BB',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0, 119, 187, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 119, 187, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 119, 187, 0.3)';
            }
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: '2rem',
        color: '#666',
        fontSize: '0.95rem'
      }}>
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: loading ? '#999' : '#0077BB',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            textDecoration: 'underline'
          }}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}