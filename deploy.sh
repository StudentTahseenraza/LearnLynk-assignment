#!/bin/bash

echo "🚀 Building LearnLynk CRM for production..."

# Build Next.js application
cd frontend
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo ""
  echo "📋 Deployment instructions:"
  echo "1. Start the production server: npm run start"
  echo "2. Or deploy to Vercel: vercel --prod"
  echo "3. Or deploy to your own server"
else
  echo "❌ Build failed. Check errors above."
  exit 1
fi