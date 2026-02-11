"""
Visual Buddy - System Test Script
Tests all components before running the main application
"""

import sys
import os

def test_imports():
    """Test if all required packages are installed"""
    print("🧪 Testing imports...")
    
    packages = [
        ("cv2", "opencv-python"),
        ("google.generativeai", "google-generativeai"),
        ("gtts", "gtts"),
        ("pygame", "pygame"),
        ("PIL", "pillow"),
        ("dotenv", "python-dotenv")
    ]
    
    missing = []
    for module, package in packages:
        try:
            __import__(module)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} (not installed)")
            missing.append(package)
    
    return missing

def test_camera():
    """Test if camera is accessible"""
    print("\n📸 Testing camera access...")
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("  ✅ Camera is accessible")
            cap.release()
            return True
        else:
            print("  ❌ Camera could not be opened")
            return False
    except Exception as e:
        print(f"  ❌ Camera test failed: {e}")
        return False

def test_api_key():
    """Test if API key is configured"""
    print("\n🔑 Testing API configuration...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("  ❌ GEMINI_API_KEY not found in .env file")
        print("     Create a .env file with: GEMINI_API_KEY=your_key_here")
        return False
    elif api_key == "your_api_key_here":
        print("  ❌ GEMINI_API_KEY is still the default placeholder")
        print("     Replace with your actual API key from https://makersuite.google.com/app/apikey")
        return False
    else:
        print(f"  ✅ API key found (starts with: {api_key[:10]}...)")
        return True

def test_audio():
    """Test if audio system works"""
    print("\n🔊 Testing audio system...")
    try:
        from pygame import mixer
        mixer.init()
        print("  ✅ Audio mixer initialized")
        mixer.quit()
        return True
    except Exception as e:
        print(f"  ❌ Audio test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("👁️  VISUAL BUDDY - SYSTEM TEST")
    print("=" * 60)
    
    # Test imports
    missing_packages = test_imports()
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print(f"\nInstall with: pip install {' '.join(missing_packages)}")
        return False
    
    # Test camera
    camera_ok = test_camera()
    
    # Test API key
    api_ok = test_api_key()
    
    # Test audio
    audio_ok = test_audio()
    
    # Final result
    print("\n" + "=" * 60)
    if camera_ok and api_ok and audio_ok:
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n🚀 You're ready to run: python main.py")
        return True
    else:
        print("❌ SOME TESTS FAILED")
        print("=" * 60)
        print("\n⚠️  Please fix the issues above before running the app")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)