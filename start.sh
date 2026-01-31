#!/bin/bash

# HRIS System - Development Startup Script
# Runs all services: MySQL, Express API, Golang API, React Frontend

echo "🚀 Starting HRIS System..."
echo "================================"

# Check if MySQL is running
echo "📊 Checking MySQL..."
if ! pgrep -x "mysqld" > /dev/null; then
    echo "⚠️  MySQL is not running. Please start MySQL first:"
    echo "   sudo systemctl start mysql"
    exit 1
fi
echo "✅ MySQL is running"

# Check if database exists
echo "📊 Checking database..."
DB_EXISTS=$(mysql -u ${DB_USER:-azaryageraldo} -p${DB_PASSWORD:-anes0709} -e "SHOW DATABASES LIKE 'db_hris';" | grep db_hris)
if [ -z "$DB_EXISTS" ]; then
    echo "⚠️  Database 'db_hris' not found. Creating..."
    mysql -u ${DB_USER:-azaryageraldo} -p${DB_PASSWORD:-anes0709} < database/schema.sql
    echo "✅ Database created"
else
    echo "✅ Database exists"
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Kill existing processes on ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Create log directory
mkdir -p logs

# Start Express API (Panel Admin)
echo "🟢 Starting Express API (Port 5000)..."
cd api-express
npm run dev > ../logs/express.log 2>&1 &
EXPRESS_PID=$!
echo "   PID: $EXPRESS_PID"
cd ..

# Wait for Express to start
sleep 3

# Start Golang API (Panel HR/Finance/Employee)
echo "🔵 Starting Golang API (Port 8080)..."
cd api-golang
go run cmd/main.go > ../logs/golang.log 2>&1 &
GOLANG_PID=$!
echo "   PID: $GOLANG_PID"
cd ..

# Wait for Golang to start
sleep 3

# Start React Frontend
echo "⚛️  Starting React Frontend (Port 3000)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
cd ..

# Wait for all services to start
sleep 5

echo ""
echo "================================"
echo "✅ HRIS System Started Successfully!"
echo "================================"
echo ""
echo "📍 Services:"
echo "   🟢 Express API:  http://localhost:5000"
echo "   🔵 Golang API:   http://localhost:8080"
echo "   ⚛️  Frontend:     http://localhost:3000"
echo ""
echo "📊 Admin Login:"
echo "   Email:    admin@gmail.com"
echo "   Password: dsadsadsa"
echo ""
echo "📝 Logs:"
echo "   Express: tail -f logs/express.log"
echo "   Golang:  tail -f logs/golang.log"
echo "   React:   tail -f logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop.sh"
echo ""
echo "Press Ctrl+C to stop monitoring..."

# Save PIDs to file
echo "$EXPRESS_PID" > logs/express.pid
echo "$GOLANG_PID" > logs/golang.pid
echo "$FRONTEND_PID" > logs/frontend.pid

# Monitor logs
tail -f logs/express.log logs/golang.log logs/frontend.log
