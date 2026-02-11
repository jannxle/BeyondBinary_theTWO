// API service for Hand2Voice backend
const API_BASE_URL = 'http://localhost:5004/api';

export const api = {
  // ==================== AUTH ====================
  
  signup: async (name, email, password, disabilities = []) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password,
        disabilities
      })
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    return response.json();
  },

  updateProfile: async (email, name, disabilities) => {
    const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        name,
        disabilities
      })
    });
    return response.json();
  },

  // ==================== HISTORY ====================

  getHistory: async (email) => {
    const response = await fetch(`${API_BASE_URL}/history/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  addHistory: async (email, entry) => {
    const response = await fetch(`${API_BASE_URL}/history/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        entry
      })
    });
    return response.json();
  },

  clearHistory: async (email) => {
    const response = await fetch(`${API_BASE_URL}/history/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  // ==================== VISION ANALYSIS ====================

  analyzeImage: async (imageBlob, mode = 'general') => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'capture.jpg');
    formData.append('mode', mode);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // ==================== SPEECH TRANSCRIPTION ====================

  transcribeAudio: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // ==================== HEALTH CHECK ====================

  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
};