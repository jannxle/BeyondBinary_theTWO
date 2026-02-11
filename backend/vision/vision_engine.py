import google.generativeai as genai
import os
from PIL import Image
from dotenv import load_dotenv

class VisualAssistant:
    """Vision-powered assistant using Google Gemini API"""
    
    def __init__(self):
        """Initialize the assistant with API configuration"""
        load_dotenv()
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Define prompts for different modes
        self.prompts = {
            "general": """You are an assistant for someone with visual impairment. 
Describe what is in this image in a clear, concise way. Focus on:
1. Main objects or people present
2. Any visible text (signs, labels, instructions)
3. Potential hazards or obstacles
4. Spatial layout if relevant

Keep your response natural and conversational, under 3 sentences.""",
            
            "text": """You are helping someone read text in their environment.
Extract and read ALL visible text in this image, including:
- Signs and labels
- Product names and descriptions
- Instructions or warnings
- Any other written content

If there's no text, say "I don't see any readable text in this image."
Read the text naturally, as you would aloud.""",
            
            "hazard": """You are a safety assistant for someone with visual impairment.
Analyze this image for potential hazards or obstacles, such as:
- Steps, stairs, or elevation changes
- Obstacles in the path
- Wet floors or spills
- Sharp objects
- Traffic or vehicles
- Any safety warnings visible

If no hazards are present, say "No immediate hazards detected."
Be specific about location (e.g., "on your left", "directly ahead")."""
        }
    
    def analyze_image(self, image_path, mode="general"):
        """
        Analyze an image using the specified mode
        
        Args:
            image_path: Path to the image file
            mode: Analysis mode - "general", "text", or "hazard"
            
        Returns:
            String description of the image
        """
        try:
            # Load and validate image
            if not os.path.exists(image_path):
                return "Error: Image file not found"
            
            img = Image.open(image_path)
            
            # Get appropriate prompt
            prompt = self.prompts.get(mode, self.prompts["general"])
            
            # Generate response
            response = self.model.generate_content([prompt, img])
            
            if response.text:
                return response.text.strip()
            else:
                return "I couldn't generate a description for this image."
                
        except Exception as e:
            print(f"Vision engine error: {e}")
            return f"Analysis failed: {str(e)}"
    
    def analyze_with_custom_prompt(self, image_path, custom_prompt):
        """
        Analyze an image with a custom prompt
        
        Args:
            image_path: Path to the image file
            custom_prompt: Custom prompt for the analysis
            
        Returns:
            String description of the image
        """
        try:
            img = Image.open(image_path)
            response = self.model.generate_content([custom_prompt, img])
            return response.text.strip() if response.text else "No response generated"
        except Exception as e:
            return f"Analysis failed: {str(e)}"