from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import hashlib
import whisper
from vision.vision_engine import VisualAssistant

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# ==================== FILE STORAGE ====================
USERS_FILE = 'users.json'
HISTORY_FILE = 'history.json'

# ==================== LOAD MODELS AT STARTUP ====================
print("=" * 60)
print("Loading AI Models...")
print("=" * 60)

# Load Vision Assistant
print("Loading Vision Assistant...")
vision_assistant = VisualAssistant()
print("Vision Assistant ready!")

# Load Whisper model
print("Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("Whisper model ready!")

print("=" * 60)
print("All models loaded successfully!")
print("=" * 60)

# ==================== HELPER FUNCTIONS ====================

def hash_password(password):
    """Simple password hashing (use bcrypt or similar in production!)"""
    return hashlib.sha256(password.encode()).hexdigest()

def load_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def load_history():
    """Load history for all users"""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_history(history_data):
    """Save history for all users"""
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history_data, f, indent=2)

# ==================== AUTH ENDPOINTS ====================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        
        # Validate input
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Normalize email to lowercase
        email = data['email'].lower().strip()
        
        users = load_users()
        
        if email in users:
            return jsonify({'success': False, 'error': 'Email already exists'}), 400
        
        # Hash the password
        hashed_password = hash_password(data['password'])
        
        users[email] = {
            'name': data['name'],
            'email': email,
            'password': hashed_password,
            'disabilities': data.get('disabilities', []),
            'created_at': datetime.now().isoformat()
        }
        save_users(users)
        
        # Initialize empty history for new user
        history_data = load_history()
        history_data[email] = []
        save_history(history_data)
        
        # Return user without password
        user_response = {
            'name': users[email]['name'],
            'email': users[email]['email'],
            'disabilities': users[email]['disabilities']
        }
        
        return jsonify({'success': True, 'user': user_response})
    
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'success': False, 'error': 'Server error occurred'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        # Validate input
        if not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Missing email or password'}), 400
        
        # Normalize email to lowercase
        email = data['email'].lower().strip()
        
        users = load_users()
        
        user = users.get(email)
        if not user:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Check password
        hashed_password = hash_password(data['password'])
        if user['password'] != hashed_password:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Return user without password
        user_response = {
            'name': user['name'],
            'email': user['email'],
            'disabilities': user.get('disabilities', [])
        }
        
        return jsonify({'success': True, 'user': user_response})
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'success': False, 'error': 'Server error occurred'}), 500

@app.route('/api/auth/update-profile', methods=['POST'])
def update_profile():
    try:
        data = request.json
        
        if not data.get('email'):
            return jsonify({'success': False, 'error': 'Email required'}), 400
        
        # Normalize email to lowercase
        email = data['email'].lower().strip()
        
        users = load_users()
        
        if email not in users:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Update allowed fields
        if 'name' in data:
            users[email]['name'] = data['name']
        if 'disabilities' in data:
            users[email]['disabilities'] = data['disabilities']
        
        save_users(users)
        
        user_response = {
            'name': users[email]['name'],
            'email': users[email]['email'],
            'disabilities': users[email]['disabilities']
        }
        
        return jsonify({'success': True, 'user': user_response})
    
    except Exception as e:
        print(f"Update profile error: {str(e)}")
        return jsonify({'success': False, 'error': 'Server error occurred'}), 500

# ==================== HISTORY ENDPOINTS ====================

@app.route('/api/history/get', methods=['POST'])
def get_history():
    """Get history for a specific user"""
    try:
        data = request.json
        
        if not data.get('email'):
            return jsonify({'success': False, 'error': 'Email required'}), 400
        
        # Normalize email to lowercase
        email = data['email'].lower().strip()
        
        history_data = load_history()
        user_history = history_data.get(email, [])
        
        return jsonify({'success': True, 'history': user_history})
    
    except Exception as e:
        print(f"Get history error: {str(e)}")
        return jsonify({'success': False, 'error': 'Server error occurred'}), 500

@app.route('/api/history/add', methods=['POST'])
def add_history():
    """Add a new history entry for a user"""
    try:
        data = request.json
        
        if not data.get('email'):
            return jsonify({'success': False, 'error': 'Email required'}), 400
        
        if not data.get('entry'):
            return jsonify({'success': False, 'error': 'History entry required'}), 400
        
        # Normalize email to lowercase
        email = data['email'].lower().strip()
        
        history_data = load_history()
        
        # Initialize user history if doesn't exist
        if email not in history_data:
            history_data[email] = []
        
        # Add the new entry
        history_entry = data['entry']
        history_entry['timestamp'] = datetime.now().isoformat()
        
        history_data[email].insert(0, history_entry)  # Add to beginning
        
        # Keep only last 100 entries per user
        history_data[email] = history_data[email][:100]
        
        save_history(history_data)
        
        return jsonify({
            'success': True, 
            'message': 'History entry added',
            'history': history_data[email]
        })
    
    except Exception as e:
        print(f"Add history error: {str(e)}")
        return jsonify({'success': False, 'error': 'Server error occurred'}), 500

@app.route('/api/history/clear', methods=['POST'])
def clear_history():
    """Clear all history for a user"""
    try:
        data = request.json
        
        if not data.get('email'):
            return jsonify({'success': False, 'error': 'Email required'}), 400
        
        # Normalize email to lowercase
        email = data['email'].lower().strip()
        
        history_data = load_history()
        history_data[email] = []
        save_history(history_data)
        
        return jsonify({'success': True, 'message': 'History cleared'})
    
    except Exception as e:
        print(f"Clear history error: {str(e)}")
        return jsonify({'success': False, 'error': 'Server error occurred'}), 500

# ==================== VISION ANALYSIS ENDPOINTS ====================

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_image():
    """Analyze image using Vision Assistant"""
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False, 
                'error': 'No image provided'
            }), 400
        
        mode = request.form.get('mode', 'general')
        image_file = request.files['image']
        
        print(f"Received image for analysis (mode: {mode})")
        
        # Save temporarily
        temp_path = 'temp_capture.jpg'
        image_file.save(temp_path)
        
        # Analyze using the vision assistant
        result = vision_assistant.analyze_image(temp_path, mode=mode)
        
        # Clean up
        os.remove(temp_path)
        
        print(f"Analysis complete: {result[:100]}...")
        
        return jsonify({
            'success': True,
            'description': result,
            'mode': mode
        })
    
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return jsonify({
            'success': False, 
            'error': str(e)
        }), 500

# ==================== SPEECH TRANSCRIPTION ENDPOINTS ====================

@app.route('/api/transcribe', methods=['POST', 'OPTIONS'])
def transcribe_audio():
    """Transcribe audio using Whisper"""
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        if 'audio' not in request.files:
            return jsonify({
                'error': 'No audio file provided',
                'success': False
            }), 400
        
        audio_file = request.files['audio']
        
        # Save temporarily
        temp_path = 'temp_audio.webm'
        audio_file.save(temp_path)
        
        print(f"🎤 Transcribing audio...")
        
        # Transcribe
        result = whisper_model.transcribe(
            temp_path,
            language='en',
            fp16=False
        )
        
        # Clean up
        os.remove(temp_path)
        
        print(f"✅ Transcription: {result['text']}")
        
        return jsonify({
            'text': result['text'].strip(),
            'success': True
        })
    
    except Exception as e:
        print(f"❌ Transcription error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'message': 'Hand2Voice Unified Server is running',
        'services': {
            'auth': 'running',
            'vision': 'running',
            'speech': 'running'
        }
    })

# ==================== MAIN ====================

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("Hand2Voice Unified Server")
    print("=" * 60)
    print("Server running at: http://localhost:5004")
    print("=" * 60)
    print("\nAvailable Endpoints:")
    print("\nAuthentication:")
    print("  - POST /api/auth/signup")
    print("  - POST /api/auth/login")
    print("  - POST /api/auth/update-profile")
    print("\nHistory:")
    print("  - POST /api/history/get")
    print("  - POST /api/history/add")
    print("  - POST /api/history/clear")
    print("\nVision Analysis:")
    print("  - POST /api/analyze")
    print("\nSpeech Transcription:")
    print("  - POST /api/transcribe")
    print("\nHealth Check:")
    print("  - GET  /api/health")
    print("=" * 60 + "\n")
    
    app.run(debug=True, port=5004, host='0.0.0.0')