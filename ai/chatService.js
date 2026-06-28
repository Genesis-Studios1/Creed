const fetch = require('node-fetch');

const DEFAULT_SYSTEM_PROMPT = `You are a broad-knowledge AI assistant for Creed Bot.
You answer general questions clearly and helpfully, explain ideas simply, and stay conversational.
You can help with coding, writing, research, brainstorming, and everyday questions.
Keep answers concise, useful, and natural. Avoid pretending to be a human.`;

function getLastUserMessage(messages = []) {
  const entries = Array.isArray(messages) ? messages : [];
  const lastUser = [...entries].reverse().find((message) => message?.role === 'user');
  return lastUser?.content || '';
}

function buildFallbackReply(input = '') {
  const text = String(input || '').toLowerCase();

  if (/(help|command|commands|prefix|setup|how do|what can)/i.test(text)) {
    return 'Creed Bot can help with moderation, auto-roles, welcome messages, and server commands. Try !help in Discord or ask me for a specific feature.';
  }

  if (/(hello|hi|hey|yo|sup)/i.test(text)) {
    return 'Hey! I’m Creed’s AI assistant. Ask me almost anything and I’ll do my best to help.';
  }

  if (/(music|youtube|stream|social|media)/i.test(text)) {
    return 'I can help you promote your server, explain bot features, or suggest ways to keep members engaged.';
  }

  if (/(who are you|what are you|what can you do)/i.test(text)) {
    return 'I’m a broad-knowledge assistant for the website. I can help with general questions, coding, writing, and bot-related topics.';
  }

  return 'I’m Creed’s broad-knowledge assistant. Ask me about coding, writing, general knowledge, or how to use the bot.';
}

function resolveModelConfig({ providerHint, apiKeyHint, modelHint, baseUrlHint } = {}) {
  const provider = String(providerHint || process.env.AI_PROVIDER || '').toLowerCase();
  const apiKey = apiKeyHint || process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY || '';
  const model = modelHint || process.env.AI_MODEL || '';
  const baseUrl = baseUrlHint || process.env.AI_BASE_URL || '';

  const resolvedProvider = provider || (process.env.OPENROUTER_API_KEY ? 'openrouter' : process.env.OPENAI_API_KEY || process.env.AI_API_KEY ? 'openai' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'none');

  return {
    provider: resolvedProvider,
    apiKey,
    model: model || (
      resolvedProvider === 'anthropic' ? process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest' :
      resolvedProvider === 'openrouter' ? 'openai/gpt-4.1-mini' :
      resolvedProvider === 'openai' ? 'gpt-4.1-mini' : ''
    ),
    baseUrl: baseUrl || (
      resolvedProvider === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions' :
      resolvedProvider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : ''
    )
  };
}

async function generateCreedReply({ messages = [], systemPrompt = DEFAULT_SYSTEM_PROMPT } = {}) {
  const userInput = getLastUserMessage(messages);
  const config = resolveModelConfig();

  if (!config.apiKey || config.provider === 'none') {
    return buildFallbackReply(userInput);
  }

  try {
    if (config.provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 1000,
          system: systemPrompt,
          messages
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Anthropic request failed');
      }

      return data.content?.[0]?.text || buildFallbackReply(userInput);
    }

    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        ...(config.provider === 'openrouter' ? {
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Creed Bot Website'
        } : {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: [...messages, { role: 'system', content: systemPrompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || data?.message || 'Model request failed');
    }

    return data.choices?.[0]?.message?.content || buildFallbackReply(userInput);
  } catch (error) {
    return buildFallbackReply(userInput);
  }
}

module.exports = {
  DEFAULT_SYSTEM_PROMPT,
  buildFallbackReply,
  generateCreedReply,
  resolveModelConfig
};
