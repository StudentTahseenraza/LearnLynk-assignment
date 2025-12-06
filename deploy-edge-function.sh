#!/bin/bash

# Deploy Supabase Edge Function
echo "Deploying Edge Function to production..."

# Set Supabase project
supabase link --project-ref vvztsqjjttrthtzchlcx

# Set secrets
supabase secrets set SUPABASE_URL=https://vvztsqjjttrthtzchlcx.supabase.co
# Get service role key from Supabase dashboard: Settings > API
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Deploy function
supabase functions deploy create-task --no-verify-jwt

echo "✅ Edge Function deployed successfully!"