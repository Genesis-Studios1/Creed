# AI chatbot setup

The website chat works without any API key (built-in answers for commands, greetings, and how-tos).  
Add one of the providers below for full AI knowledge on any topic.

## Recommended: OpenRouter (easiest alternative to Groq)

One key, many models, includes **free** models.

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Create an API key
3. In **Vercel → Settings → Environment Variables**, add:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key_here
AI_MODEL=google/gemini-2.0-flash-exp:free
APP_URL=https://creed-plum.vercel.app
```

4. Redeploy the site

Other free OpenRouter models you can try:
- `google/gemini-2.0-flash-exp:free`
- `meta-llama/llama-3.3-70b-instruct:free`
- `qwen/qwen-2.5-72b-instruct:free`

---

## Google Gemini (free, direct from Google)

1. Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Add to Vercel:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
AI_MODEL=gemini-2.0-flash
```

3. Redeploy

---

## DeepSeek (cheap, good quality)

1. Sign up at [platform.deepseek.com](https://platform.deepseek.com)
2. Add to Vercel:

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_key_here
AI_MODEL=deepseek-chat
```

3. Redeploy

---

## OpenAI

```env
AI_PROVIDER=openai
AI_API_KEY=your_openai_key
AI_MODEL=gpt-4.1-mini
```

Get a key at [platform.openai.com](https://platform.openai.com)

---

## Anthropic (Claude)

```env
AI_PROVIDER=anthropic
AI_API_KEY=your_anthropic_key
AI_MODEL=claude-3-5-haiku-latest
```

Get a key at [console.anthropic.com](https://console.anthropic.com)

---

## Groq (optional — if their status is OK)

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_key
AI_MODEL=llama-3.3-70b-versatile
```

---

## Quick pick

| Provider    | Cost        | Best for                          |
|------------|-------------|-----------------------------------|
| OpenRouter | Free models | Easiest Groq replacement          |
| Gemini     | Free tier   | Reliable, fast, from Google       |
| DeepSeek   | Very cheap  | Strong coding & general chat      |
| OpenAI     | Paid        | Highest quality, most well-known  |

If Groq is down, use **OpenRouter** or **Gemini** first.
