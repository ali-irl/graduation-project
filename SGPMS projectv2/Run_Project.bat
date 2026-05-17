@echo off
title SGPMS Dual Server Controller
echo --------------------------------------------------
echo Launching SGPMS Full-Stack Ecosystem...
echo --------------------------------------------------

:: Change directory to your project folder
cd /d "C:\Users\user\Desktop\SGPMS projectv2"

:: 1. Start the Database Backend in a new distinct window
echo Launching Database Server on Port 5000...
start "SGPMS Database Engine" cmd /k "C:\Users\user\AppData\Local\Programs\Python\Python313\python.exe" app.py

:: 2. Start the AI Backend in a second distinct window
echo Launching Gemini AI Engine on Port 5001...
start "SGPMS AI Assistant Engine" cmd /k "C:\Users\user\AppData\Local\Programs\Python\Python313\python.exe" Ai.py

echo --------------------------------------------------
echo Success! Both servers are initializing in separate windows.
echo You can minimize them and load your HTML interface now.
echo --------------------------------------------------
pause