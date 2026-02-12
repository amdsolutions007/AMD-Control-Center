#!/bin/bash
# Ghost Writer Pro - Railway Deployment Script

echo "🚀 Deploying Ghost Writer Pro to Railway..."
echo ""

# Deploy Telegram Bot Service
echo "📱 Creating Telegram Approval Bot service..."
npx -y @railway/cli up --dockerfile Dockerfile.telegram --service telegram-bot

echo ""
echo "✅ Telegram Bot deployed"
echo ""

# Deploy Ghost Writer Poster Service  
echo "🤖 Creating Ghost Writer Poster service..."
npx -y @railway/cli up --dockerfile Dockerfile.ghostwriter --service ghost-writer

echo ""
echo "✅ Ghost Writer Poster deployed"
echo ""

echo "🎉 Ghost Writer Pro deployment complete!"
echo ""
echo "Next steps:"
echo "1. Check Railway dashboard for service status"
echo "2. Open Telegram and message @AMDSolutions007_bot"
echo "3. Send /start to begin"
echo "4. Send /generate for first Lagos post"
