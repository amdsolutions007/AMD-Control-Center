#!/bin/bash

# AMD Social Engine - Setup Script
# Run this to set up the social automation system

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         🤖 AMD SOCIAL ENGINE - SETUP                       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"

echo ""
echo "📦 Installing Python dependencies..."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create virtual environment (optional but recommended)
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "📥 Installing packages..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Dependencies installed!"

# Check credentials
echo ""
echo "🔍 Checking credentials..."
python3 config.py

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         ✅ SETUP COMPLETE!                                 ║"
echo "║                                                           ║"
echo "║         Next steps:                                       ║"
echo "║         1. Add Twitter credentials to .env                ║"
echo "║         2. Run: python run_bot.py --test                  ║"
echo "║         3. Run: python run_bot.py (production)            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
