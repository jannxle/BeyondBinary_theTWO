from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os

app = Flask(__name__)

#Enable CORS properly
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Load Whisper model at startup
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Model loaded!")

@app.route('/api/transcribe', methods=['POST', 'OPTIONS'])
def transcribe_audio():
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
        
        print(f"Transcribing audio...")
        
        # Transcribe
        result = model.transcribe(
            temp_path,
            language='en',
            fp16=False
        )
        
        # Clean up
        os.remove(temp_path)
        
        print(f"Transcription: {result['text']}")
        
        return jsonify({
            'text': result['text'].strip(),
            'success': True
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Whisper API is running'
    })

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5001")
    app.run(debug=True, port=5001, host='0.0.0.0')