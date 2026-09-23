@echo off
title Intra Decor - React + Node.js + MySQL Fullstack
cls
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║    🏠  INTRA DECOR — MERN Stack (MySQL Edition)      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  📋 Make sure XAMPP MySQL is running first!
echo.
echo  🔧 Backend  (Node.js + Express + MySQL)
echo      API: http://localhost:5050/api
echo.
echo  🎨 Frontend (React + Tailwind CSS)
echo      App: http://localhost:5180
echo.
echo  Starting both servers...
echo.

start "IntraDecor Backend - Node.js API" cmd /k "cd /d "%~dp0server" && echo Starting Node.js + MySQL Backend... && node server.js"
timeout /t 3 /nobreak >nul
start "IntraDecor Frontend - React App" cmd /k "cd /d "%~dp0client" && echo Starting React + Tailwind Frontend... && npm run dev"

echo  ✅ Both servers launching in separate windows!
echo.
echo  Press any key to close this window...
pause >nul
