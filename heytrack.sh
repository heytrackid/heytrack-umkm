#!/bin/bash

# HeyTrack Development Script
# Quick commands for development workflow

case "$1" in
    "dev")
        echo "🚀 Starting HeyTrack development server with npm..."
        npm run dev
        ;;
    "dev:webpack")
        echo "⚙️ Starting HeyTrack with Webpack..."
        npm run dev:webpack
        ;;
    "dev:clean")
        echo "🧹 Clean start - removing cache and starting fresh..."
        rm -rf .next node_modules/.cache
        npm run dev
        ;;
    "build")
        echo "🔨 Building HeyTrack for production..."
        npm run build
        ;;
    "start")
        echo "⚡ Starting HeyTrack production server..."
        npm run start
        ;;
    "lint")
        echo "🔍 Running linter..."
        npm run lint
        ;;
    "clean")
        echo "🧹 Full cleanup - removing node_modules and reinstalling..."
        rm -rf node_modules package-lock.json
        npm install --legacy-peer-deps
        ;;
    *)
        echo "📋 HeyTrack Development Commands:"
        echo "  ./heytrack.sh dev     - Start development server"
        echo "  ./heytrack.sh build   - Build for production"
        echo "  ./heytrack.sh start   - Start production server"
        echo "  ./heytrack.sh clean   - Clean and reinstall dependencies"
        echo "  ./heytrack.sh test    - Run tests"
        echo "  ./heytrack.sh lint    - Run linter"
        echo ""
        echo "🌐 Application URLs:"
        echo "  Homepage:    http://localhost:3000"
        echo "  Login:       http://localhost:3000/auth/login"
        echo "  Register:    http://localhost:3000/auth/register"
        echo "  Dashboard:   http://localhost:3000/dashboard"
        echo "  AI Chatbot:  http://localhost:3000/ai-chatbot"
        ;;
esac
