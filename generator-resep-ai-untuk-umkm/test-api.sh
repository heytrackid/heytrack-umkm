#!/bin/bash
# Test OpenRouter API Key

echo "Testing OpenRouter API Key..."
echo "API Key: ${OPENROUTER_API_KEY:0:20}..."

curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemini-2.5-flash-lite",
    "messages": [{"role": "user", "content": "Say hello in Indonesian"}]
  }' \
  --max-time 10 \
  --silent \
  --show-error \
  | head -20

echo ""
echo "Jika berhasil, akan muncul response JSON dengan pesan salam."
