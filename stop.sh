#!/bin/bash

# HRIS System - Stop Script
# Stops all running services

echo "🛑 Stopping HRIS System..."

# Kill processes by PID
if [ -f logs/express.pid ]; then
    EXPRESS_PID=$(cat logs/express.pid)
    kill $EXPRESS_PID 2>/dev/null && echo "✅ Stopped Express API (PID: $EXPRESS_PID)"
    rm logs/express.pid
fi

if [ -f logs/golang.pid ]; then
    GOLANG_PID=$(cat logs/golang.pid)
    kill $GOLANG_PID 2>/dev/null && echo "✅ Stopped Golang API (PID: $GOLANG_PID)"
    rm logs/golang.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo "✅ Stopped React Frontend (PID: $FRONTEND_PID)"
    rm logs/frontend.pid
fi

# Kill by port as backup
lsof -ti:5000 | xargs kill -9 2>/dev/null && echo "✅ Killed process on port 5000"
lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "✅ Killed process on port 8080"
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Killed process on port 3000"

echo ""
echo "✅ All services stopped!"
