import cv2
import os
import time
from vision_engine import VisualAssistant
from gtts import gTTS
from pygame import mixer

class VisualBuddy:
    def __init__(self):
        """Initialize the Visual Buddy application"""
        self.assistant = VisualAssistant()
        mixer.init()
        self.is_processing = False
        
    def speak(self, text):
        """Convert text to speech and play it"""
        print(f"\n🔊 Assistant: {text}\n")
        try:
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save("speech.mp3")
            mixer.music.load("speech.mp3")
            mixer.music.play()
            
            # Wait for audio to finish playing
            while mixer.music.get_busy():
                time.sleep(0.1)
                
        except Exception as e:
            print(f"Speech error: {e}")
    
    def run(self):
        """Main application loop"""
        # Try to open camera
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Error: Could not open camera")
            return
        
        print("=" * 60)
        print("VISUAL BUDDY - Context-Aware Assistant")
        print("=" * 60)
        print("\nControls:")
        print("  SPACE - Capture and describe what camera sees")
        print("  'r'   - Read text only (optimized for signs/labels)")
        print("  'h'   - Identify hazards/obstacles")
        print("  'q'   - Quit application")
        print("\nCamera feed starting...\n")
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Error: Failed to read from camera")
                    break
                
                # Display status on frame
                status_text = "Ready" if not self.is_processing else "Processing..."
                cv2.putText(frame, status_text, (10, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                cv2.imshow('Visual Buddy Feed', frame)
                key = cv2.waitKey(1) & 0xFF
                
                if self.is_processing:
                    continue
                
                # Handle different commands
                if key == ord(' '):  # General description
                    self.capture_and_analyze(frame, mode="general")
                    
                elif key == ord('r'):  # Read text
                    self.capture_and_analyze(frame, mode="text")
                    
                elif key == ord('h'):  # Hazard detection
                    self.capture_and_analyze(frame, mode="hazard")
                    
                elif key == ord('q'):
                    print("\nShutting down Visual Buddy...")
                    break
                    
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
        finally:
            cap.release()
            cv2.destroyAllWindows()
            mixer.quit()
            
            # Clean up temporary files
            if os.path.exists("capture.jpg"):
                os.remove("capture.jpg")
            if os.path.exists("speech.mp3"):
                os.remove("speech.mp3")
    
    def capture_and_analyze(self, frame, mode="general"):
        """Capture frame and analyze based on mode"""
        self.is_processing = True
        
        try:
            # Save the captured frame
            cv2.imwrite("capture.jpg", frame)
            print(f"📸 Captured! Analyzing ({mode} mode)...")
            
            # Get description from vision engine
            description = self.assistant.analyze_image("capture.jpg", mode=mode)
            
            if description:
                self.speak(description)
            else:
                self.speak("Sorry, I couldn't analyze the image.")
                
        except Exception as e:
            print(f"Analysis error: {e}")
            self.speak("Sorry, an error occurred during analysis.")
        finally:
            self.is_processing = False



if __name__ == "__main__":
    app = VisualBuddy()
    app.run()