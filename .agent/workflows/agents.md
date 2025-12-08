# AI Model Preference

## Model to Use

Always use **x-ai/grok-4.1-fast** for all OpenRouter AI calls.

## Where Models are Configured

- `src/app/api/ai/generate-recipe/constants.ts` - PRIMARY_MODEL, FALLBACK_MODEL
- `src/services/ai/AiService.ts` - Chat AI model
- `src/app/api/recipes/generate/route.ts` - Recipe generation model
