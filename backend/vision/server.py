from flask import Flask, request, jsonify
from flask_cors import CORS
from vision_engine import VisualAssistant
import os

app = Flask(__name__)

# Enable CORS for your React frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize the vision assistant once at startup
print("🚀 Loading Vision Assistant...")
assistant = VisualAssistant()
print("✅ Vision Assistant ready!")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Vision API is running'
    })

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_image():
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
        
        print(f"📸 Received image for analysis (mode: {mode})")
        
        # Save temporarily
        temp_path = 'temp_capture.jpg'
        image_file.save(temp_path)
        
        # Analyze using the vision assistant
        result = assistant.analyze_image(temp_path, mode=mode)
        
        # Clean up
        os.remove(temp_path)
        
        print(f"✅ Analysis complete: {result[:100]}...")
        
        return jsonify({
            'success': True,
            'description': result,
            'mode': mode
        })
    
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        return jsonify({
            'success': False, 
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🌐 Starting Vision API Server")
    print("=" * 60)
    print("📍 Server running at: http://localhost:5002")  # Changed to 5002
    print("🔗 Frontend should connect to: http://localhost:5002/api/analyze")
    print("=" * 60)
    app.run(debug=True, port=5002, host='0.0.0.0')  # Changed to 5002
