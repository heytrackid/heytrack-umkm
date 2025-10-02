#!/bin/bash

# Setup Vercel Environment Variables
echo "🚀 Setting up Vercel environment variables..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found! Please create it first."
    exit 1
fi

# Load environment variables from .env.local
export $(grep -v '^#' .env.local | xargs)

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found! Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set environment variables in Vercel
echo "📝 Setting environment variables in Vercel..."

# Production environment
echo "Setting NEXT_PUBLIC_SUPABASE_URL for production..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL"

echo "Setting NEXT_PUBLIC_SUPABASE_ANON_KEY for production..."
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo "Setting SUPABASE_SERVICE_ROLE_KEY for production..."
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"

echo "Setting OPENROUTER_API_KEY for production..."
vercel env add OPENROUTER_API_KEY production <<< "$OPENROUTER_API_KEY"

# Preview environment
echo "Setting NEXT_PUBLIC_SUPABASE_URL for preview..."
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "$NEXT_PUBLIC_SUPABASE_URL"

echo "Setting NEXT_PUBLIC_SUPABASE_ANON_KEY for preview..."
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo "Setting SUPABASE_SERVICE_ROLE_KEY for preview..."
vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "$SUPABASE_SERVICE_ROLE_KEY"

echo "Setting OPENROUTER_API_KEY for preview..."
vercel env add OPENROUTER_API_KEY preview <<< "$OPENROUTER_API_KEY"

# Development environment
echo "Setting NEXT_PUBLIC_SUPABASE_URL for development..."
vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "$NEXT_PUBLIC_SUPABASE_URL"

echo "Setting NEXT_PUBLIC_SUPABASE_ANON_KEY for development..."
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo "Setting SUPABASE_SERVICE_ROLE_KEY for development..."
vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "$SUPABASE_SERVICE_ROLE_KEY"

echo "Setting OPENROUTER_API_KEY for development..."
vercel env add OPENROUTER_API_KEY development <<< "$OPENROUTER_API_KEY"

echo "✅ All environment variables have been set in Vercel!"
echo "🚀 You can now deploy with: vercel --prod"