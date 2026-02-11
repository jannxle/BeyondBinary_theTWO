import cv2
import os
import time
from datetime import datetime
from vision_engine import VisualAssistant
from gtts import gTTS
from pygame import mixer
import json

class VisualBuddyAdvanced:
    def __init__(self):
        """Initialize the Visual Buddy Advanced application"""
        self.assistant = VisualAssistant()
        mixer.init()
        self.is_processing = False
        self.history = []
        self.save_screenshots = False
        self.tts_speed = "normal"  # "slow" or "normal"
        
        # Create directories
        os.makedirs("screenshots", exist_ok=True)
        os.makedirs("history", exist_ok=True)
        
    def speak(self, text, slow=None):
        """Convert text to speech and play it"""
        print(f"\n🔊 Assistant: {text}\n")
        try:
            use_slow = slow if slow is not None else (self.tts_speed == "slow")
            tts = gTTS(text=text, lang='en', slow=use_slow)
            tts.save("speech.mp3")
            mixer.music.load("speech.mp3")
            mixer.music.play()
            
            # Wait for audio to finish playing
            while mixer.music.get_busy():
                time.sleep(0.1)
                
        except Exception as e:
            print(f"❌ Speech error: {e}")
    
    def save_to_history(self, mode, description, image_path=None):
        """Save analysis to history"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "mode": mode,
            "description": description,
            "image": image_path
        }
        self.history.append(entry)
        
        # Save to file
        with open("history/session_history.json", "w") as f:
            json.dump(self.history, f, indent=2)
    
    def draw_ui(self, frame):
        """Draw UI elements on frame"""
        height, width = frame.shape[:2]
        
        # Create semi-transparent overlay for controls
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, height - 180), (width, height), (0, 0, 0), -1)
        frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
        
        # Status indicator
        status_color = (0, 165, 255) if not self.is_processing else (0, 255, 255)
        status_text = "READY" if not self.is_processing else "PROCESSING..."
        cv2.putText(frame, status_text, (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)
        
        # Controls
        controls = [
            "SPACE: Describe | R: Read Text | H: Hazards",
            "S: Screenshot On/Off | T: TTS Speed | L: Last 5",
            "C: Clear History | Q: Quit"
        ]
        
        y_offset = height - 150
        for i, control in enumerate(controls):
            cv2.putText(frame, control, (10, y_offset + i * 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Additional info
        info = f"Screenshots: {'ON' if self.save_screenshots else 'OFF'} | TTS: {self.tts_speed.upper()} | History: {len(self.history)}"
        cv2.putText(frame, info, (10, height - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        return frame
    
    def run(self):
        """Main application loop"""
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Error: Could not open camera")
            return
        
        print("=" * 80)
        print("👁️  VISUAL BUDDY ADVANCED - Context-Aware Assistant")
        print("=" * 80)
        print("\nEnhanced features: History, Screenshots, Adjustable TTS speed")
        print("\n🎥 Camera feed starting...\n")
        
        self.speak("Visual Buddy Advanced is ready. Press space to describe what I see.")
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("❌ Error: Failed to read from camera")
                    break
                
                # Draw UI
                display_frame = self.draw_ui(frame)
                cv2.imshow('Visual Buddy Advanced', display_frame)
                
                key = cv2.waitKey(1) & 0xFF
                
                if self.is_processing:
                    continue
                
                # Handle commands
                if key == ord(' '):  # General description
                    self.capture_and_analyze(frame, mode="general")
                    
                elif key == ord('r'):  # Read text
                    self.capture_and_analyze(frame, mode="text")
                    
                elif key == ord('h'):  # Hazard detection
                    self.capture_and_analyze(frame, mode="hazard")
                    
                elif key == ord('s'):  # Toggle screenshot saving
                    self.save_screenshots = not self.save_screenshots
                    status = "enabled" if self.save_screenshots else "disabled"
                    print(f"📸 Screenshot saving {status}")
                    self.speak(f"Screenshot saving {status}")
                    
                elif key == ord('t'):  # Toggle TTS speed
                    self.tts_speed = "slow" if self.tts_speed == "normal" else "normal"
                    print(f"🔊 TTS speed: {self.tts_speed}")
                    self.speak(f"Speed set to {self.tts_speed}", slow=(self.tts_speed == "slow"))
                    
                elif key == ord('l'):  # Read last 5 entries
                    self.read_history()
                    
                elif key == ord('c'):  # Clear history
                    self.history = []
                    print("🗑️  History cleared")
                    self.speak("History cleared")
                    
                elif key == ord('q'):
                    print("\n👋 Shutting down Visual Buddy Advanced...")
                    break
                    
        except KeyboardInterrupt:
            print("\n\n👋 Interrupted by user")
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
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Save capture
            cv2.imwrite("capture.jpg", frame)
            
            # Optionally save screenshot
            screenshot_path = None
            if self.save_screenshots:
                screenshot_path = f"screenshots/{mode}_{timestamp}.jpg"
                cv2.imwrite(screenshot_path, frame)
                print(f"💾 Screenshot saved: {screenshot_path}")
            
            print(f"📸 Captured! Analyzing ({mode} mode)...")
            
            # Get description
            description = self.assistant.analyze_image("capture.jpg", mode=mode)
            
            if description:
                self.speak(description)
                self.save_to_history(mode, description, screenshot_path)
            else:
                self.speak("Sorry, I couldn't analyze the image.")
                
        except Exception as e:
            print(f"❌ Analysis error: {e}")
            self.speak("Sorry, an error occurred during analysis.")
        finally:
            self.is_processing = False
    
    def read_history(self):
        """Read the last 5 history entries"""
        if not self.history:
            self.speak("No history available")
            return
        
        recent = self.history[-5:]
        self.speak(f"Last {len(recent)} descriptions:")
        
        for i, entry in enumerate(recent, 1):
            mode = entry['mode']
            desc = entry['description']
            time_str = datetime.fromisoformat(entry['timestamp']).strftime("%I:%M %p")
            self.speak(f"{i}. {mode} mode at {time_str}: {desc}")
            time.sleep(0.5)  # Brief pause between entries

if __name__ == "__main__":
    app = VisualBuddyAdvanced()
    app.run()
