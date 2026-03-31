#!/bin/bash
# 🚀 Quick Start Script for AlgoArena Playground Frontend
# 
# Usage: bash start.sh
# Or: chmod +x start.sh && ./start.sh

echo "🎯 AlgoArena Playground Frontend Starter"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install node.js >= 18.x"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "⚠️  First install failed, trying with legacy peer deps..."
        npm install --legacy-peer-deps
    fi
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "=========================================="
echo "🚀 Starting development server..."
echo "=========================================="
echo ""
echo "Frontend will start on: http://localhost:5173"
echo "Playground page: http://localhost:5173/playground/challenges"
echo ""
echo "Make sure your NestJS backend is running on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start dev server
npm run dev
