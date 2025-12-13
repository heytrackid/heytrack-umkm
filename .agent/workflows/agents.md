# AI Model Preference

## Model to Use

Always use **google/gemini-2.5-flash-lite** for all OpenRouter AI calls.
Fallback model: **google/gemini-2.0-flash-001**

## Where Models are Configured

- `src/app/api/ai/generate-recipe/constants.ts` - PRIMARY_MODEL, FALLBACK_MODEL
- `src/services/ai/AiService.ts` - Chat AI model
- `src/lib/ai/client.ts` - AI client default model
