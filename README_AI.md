# Broad-knowledge AI bot setup

This project can now use a general-purpose AI model for the website chat.

## What you need

Choose one provider:

1. OpenAI
   - Set AI_PROVIDER=openai
   - Set AI_API_KEY=your_openai_key
   - Optional: AI_MODEL=gpt-4.1-mini

2. Anthropic
   - Set AI_PROVIDER=anthropic
   - Set AI_API_KEY=your_anthropic_key
   - Optional: AI_MODEL=claude-3-5-haiku-latest

3. OpenRouter (good for broad model access)
   - Set AI_PROVIDER=openrouter
   - Set AI_API_KEY=your_openrouter_key
   - Optional: AI_MODEL=openai/gpt-4.1-mini

## Example .env values

```env
AI_PROVIDER=openrouter
AI_API_KEY=your_key_here
AI_MODEL=openai/gpt-4.1-mini
APP_URL=http://localhost:3000
```

## How it works

- If no AI key is present, the bot falls back to a built-in local response.
- If an AI key is present, the site will use that model for much broader, more general knowledge.

## Run locally

```bash
npm start
```

Then open http://localhost:3000
