# BeyondBinary_theTWO - EchoSight

## Project Overview - Problem Statement 1
Introducing EchoSight - a AI-driven assistive tool that bridges sensory gaps by converting visual environments into descriptive audio and speech into accessible text—all triggered seamlessly via hands-free voice recognition.

# Set up Instruction 
## 1. Clone Repository
```
git clone https://github.com/jannxle/BeyondBinary_theTWO.git
cd BeyondBinary_theTWO
```
## 2. Set up virtual environment 
```
1. Create 
# Mac / Linux
python3 -m venv venv

# Windows
python -m venv venv

2. Activate
# Mac / Linux
source venv/bin/activate

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (Command Prompt)
venv\Scripts\activate.bat
```

# Load EchoSight
## Backend
Open a terminal and run:
### 1. Setup backend 
```
cd backend
pip install -r requirements.txt
python finalserver.py
```

## Frontend
### Start server for frontend
Open a new terminal and run:
```
cd frontend
npm install #if not already installed
npm start
```
