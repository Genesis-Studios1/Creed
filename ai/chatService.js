const botCommands = require('./botCommands');

const DEFAULT_SYSTEM_PROMPT = `You are Creed AI — a friendly, knowledgeable assistant for the Creed Discord bot website.
You help with:
- Greetings and casual conversation
- Creed Bot slash commands (prefix is /)
- Discord bot setup, moderation, music, economy, and fun features
- General coding, tech, and "how do I run X" questions
- Everyday questions across many topics

Be warm, clear, and concise. Use bullet lists for commands. If unsure, say so honestly.`;

function getLastUserMessage(messages = []) {
  const entries = Array.isArray(messages) ? messages : [];
  const lastUser = [...entries].reverse().find((message) => message?.role === 'user');
  return lastUser?.content || '';
}

function allCommands() {
  return Object.values(botCommands.categories).flat();
}

function findCommand(query) {
  const q = String(query).toLowerCase();
  return allCommands().find((c) => q.includes(c.cmd.replace('/', '')) || q.includes(c.cmd));
}

function listCommands(category) {
  const key = category?.toLowerCase();
  const map = {
    mod: 'moderation', moderation: 'moderation',
    music: 'music', fun: 'fun', util: 'utility', utility: 'utility', ai: 'ai'
  };
  const cat = map[key];
  if (cat && botCommands.categories[cat]) {
    return botCommands.categories[cat].map((c) => `• **${c.cmd}** — ${c.desc}`).join('\n');
  }
  return allCommands().slice(0, 12).map((c) => `• **${c.cmd}** — ${c.desc}`).join('\n');
}

function buildFallbackReply(input = '') {
  const text = String(input || '').trim();
  const lower = text.toLowerCase();

  // ── Greetings & small talk ──
  if (/^(hi|hey|hello|yo|sup|hiya|howdy|good morning|good evening|good afternoon)\b/i.test(lower)) {
    return "Hey! 👋 I'm Creed AI — your assistant for this site and the Creed Discord bot. Ask me about bot commands, Discord setup, coding, or pretty much anything else!";
  }
  if (/how('re| are) you|how r u|how you doing|what'?s up|whats up/i.test(lower)) {
    return "I'm doing great, thanks for asking! ⚡ Ready to help with Creed Bot commands, tech questions, or whatever's on your mind. What can I help you with?";
  }
  if (/thank|thanks|ty\b|appreciate/i.test(lower)) {
    return "You're welcome! Happy to help anytime. 🤝";
  }
  if (/bye|goodbye|see ya|later|cya/i.test(lower)) {
    return "See you later! Come back anytime you need help with Creed Bot or anything else. 👋";
  }

  // ── Who / what are you ──
  if (/who (are|r) you|what (are|r) you|what can you do|what do you do/i.test(lower)) {
    return "I'm **Creed AI** — the website assistant for **Creed Bot**. I can chat, explain bot commands, help with coding, answer general questions, and guide you on running scripts or files. Try asking: *\"What music commands does Creed have?\"* or *\"How do I run a Python file?\"*";
  }

  // ── Specific command lookup ──
  const cmd = findCommand(lower);
  if (cmd) {
    return `**${cmd.cmd}** — ${cmd.desc}\n\nUse it in Discord by typing ${cmd.cmd} in a server where Creed Bot is installed. Need more commands? Ask *\"list music commands\"* or *\"show moderation commands\"*.`;
  }

  // ── Command categories ──
  if (/mod(eration)? command|admin command|ban|kick|mute command/i.test(lower)) {
    return `**Creed moderation commands:**\n${listCommands('moderation')}\n\nAll use the \`/\` slash prefix in Discord.`;
  }
  if (/music command|play song|queue command/i.test(lower)) {
    return `**Creed music commands:**\n${listCommands('music')}`;
  }
  if (/fun command|economy|coin|daily|meme command/i.test(lower)) {
    return `**Creed fun & economy commands:**\n${listCommands('fun')}`;
  }
  if (/util(ity)? command|serverinfo|ping command/i.test(lower)) {
    return `**Creed utility commands:**\n${listCommands('utility')}`;
  }
  if (/ai command|\/ask|\/imagine|\/code/i.test(lower)) {
    return `**Creed AI commands:**\n${listCommands('ai')}`;
  }
  if (/command|commands|prefix|slash|help|what can (the )?bot/i.test(lower)) {
    return `Creed Bot uses **slash commands** (type \`/\` in Discord). Here are some popular ones:\n${listCommands()}\n\nAsk about a category: *moderation*, *music*, *fun*, *utility*, or *ai*.`;
  }

  // ── Invite / setup ──
  if (/invite|add bot|add creed|how (to )?add/i.test(lower)) {
    return "To add **Creed Bot** to your server:\n1. Click **Invite** on the website homepage\n2. Select your Discord server\n3. Authorize the permissions\n4. Run `/help` in Discord to see all commands\n\nJoin the support server: https://discord.gg/E9WMbP472v";
  }
  if (/support server|discord server|join server/i.test(lower)) {
    return "Join the official Creed community: **https://discord.gg/E9WMbP472v** — the owner is @animefan123764 (MR. ZUKO).";
  }

  // ── How to run files ──
  if (/run.*\.py|python file|how.*python/i.test(lower)) {
    return "**Run a Python file (.py):**\n1. Install Python from python.org\n2. Open terminal in the file's folder\n3. Run: `python script.py` (or `python3 script.py` on Mac/Linux)\n\nExample: `python bot.py`";
  }
  if (/run.*\.js|node file|how.*javascript|npm start/i.test(lower)) {
    return "**Run a JavaScript/Node file (.js):**\n1. Install Node.js from nodejs.org\n2. Open terminal in the project folder\n3. Run: `node file.js`\n\nFor websites with package.json: `npm install` then `npm start`";
  }
  if (/run.*\.html|open.*html|view.*website/i.test(lower)) {
    return "**Open an HTML file:**\n• Double-click it to open in your browser\n• Or right-click → Open with → Chrome/Firefox/Edge\n• For full features, run a local server: `npx serve .` or `python -m http.server`";
  }
  if (/run.*\.exe|\.bat|\.sh|shell script|batch file/i.test(lower)) {
    return "**Run executables & scripts:**\n• **.exe** — double-click or run from Command Prompt\n• **.bat** (Windows) — double-click or `script.bat` in cmd\n• **.sh** (Mac/Linux) — `chmod +x script.sh` then `./script.sh`\n\nOnly run files from sources you trust!";
  }
  if (/how (to|do i) run|execute.*file|open.*file/i.test(lower)) {
    return "**Quick guide — running files by type:**\n• `.py` → `python filename.py`\n• `.js` → `node filename.js`\n• `.html` → open in browser\n• `.exe` → double-click (Windows)\n• `.bat` → double-click or run in cmd\n\nTell me the file type and I'll give exact steps!";
  }

  // ── Coding basics ──
  if (/html|css|javascript|js\b|python|java\b|code|programming|learn to code/i.test(lower)) {
    return "Happy to help with coding! 🖥️ Tell me your language and goal — e.g. *\"How do I make a Discord bot in Python?\"* or *\"Explain HTML in simple terms.\"* I can also help debug or explain concepts step by step.";
  }

  // ── Discord general ──
  if (/discord|bot token|oauth|permission/i.test(lower)) {
    return "For Discord bots:\n• Create an app at [Discord Developer Portal](https://discord.com/developers/applications)\n• Copy the **Bot Token** (keep it secret!)\n• Enable required **Privileged Intents** if needed\n• Invite with OAuth2 URL generator\n\nCreed Bot handles moderation, music, economy & more — use `/help` in-server!";
  }

  // ── Website / login ──
  if (/login|sign in|admin panel|owner/i.test(lower)) {
    return "To log in on this website:\n1. Click **Login with Discord** on the homepage\n2. Authorize the app\n3. You'll be redirected back signed in\n\nThe admin panel is only for the bot owner (@animefan123764). If access is denied, log out and log back in with the owner account.";
  }

  // ── Default helpful response ──
  return "I'm Creed AI and I can help with:\n• **Bot commands** — ask *\"list music commands\"* or *\"what does /ban do?\"*\n• **Tech & coding** — *\"How do I run a Python file?\"*\n• **General chat** — just say hi!\n• **Discord setup** — invite links, permissions, etc.\n\nWhat would you like to know?";
}

function resolveModelConfig({ providerHint, apiKeyHint, modelHint, baseUrlHint } = {}) {
  const provider = String(providerHint || process.env.AI_PROVIDER || '').toLowerCase();
  const apiKey = apiKeyHint
    || process.env.AI_API_KEY
    || process.env.OPENROUTER_API_KEY
    || process.env.GEMINI_API_KEY
    || process.env.DEEPSEEK_API_KEY
    || process.env.OPENAI_API_KEY
    || process.env.ANTHROPIC_API_KEY
    || process.env.GROQ_API_KEY
    || '';
  const model = modelHint || process.env.AI_MODEL || '';
  const baseUrl = baseUrlHint || process.env.AI_BASE_URL || '';

  const resolvedProvider = provider || (
    process.env.OPENROUTER_API_KEY ? 'openrouter' :
    process.env.GEMINI_API_KEY ? 'gemini' :
    process.env.DEEPSEEK_API_KEY ? 'deepseek' :
    process.env.OPENAI_API_KEY || process.env.AI_API_KEY ? 'openai' :
    process.env.ANTHROPIC_API_KEY ? 'anthropic' :
    process.env.GROQ_API_KEY ? 'groq' : 'none'
  );

  return {
    provider: resolvedProvider,
    apiKey,
    model: model || (
      resolvedProvider === 'anthropic' ? process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest' :
      resolvedProvider === 'gemini' ? 'gemini-2.0-flash' :
      resolvedProvider === 'deepseek' ? 'deepseek-chat' :
      resolvedProvider === 'groq' ? 'llama-3.3-70b-versatile' :
      resolvedProvider === 'openrouter' ? 'google/gemini-2.0-flash-exp:free' :
      resolvedProvider === 'openai' ? 'gpt-4.1-mini' : ''
    ),
    baseUrl: baseUrl || (
      resolvedProvider === 'deepseek' ? 'https://api.deepseek.com/chat/completions' :
      resolvedProvider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' :
      resolvedProvider === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions' :
      resolvedProvider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : ''
    )
  };
}

async function callGemini({ apiKey, model, systemPrompt, messages }) {
  const contents = messages
    .filter((m) => m?.role && m?.content && m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Gemini request failed');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function generateCreedReply({ messages = [], systemPrompt = DEFAULT_SYSTEM_PROMPT } = {}) {
  const userInput = getLastUserMessage(messages);
  const config = resolveModelConfig();

  if (!config.apiKey || config.provider === 'none') {
    return buildFallbackReply(userInput);
  }

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.filter((m) => m?.role && m?.content)
  ];

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
          messages: messages.filter((m) => m?.role !== 'system')
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || 'Anthropic request failed');
      return data.content?.[0]?.text || buildFallbackReply(userInput);
    }

    if (config.provider === 'gemini') {
      const text = await callGemini({
        apiKey: config.apiKey,
        model: config.model,
        systemPrompt,
        messages
      });
      return text || buildFallbackReply(userInput);
    }

    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        ...(config.provider === 'openrouter' ? {
          'HTTP-Referer': process.env.APP_URL || 'https://creed-plum.vercel.app',
          'X-Title': 'Creed Bot Website'
        } : {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || data?.message || 'Model request failed');
    return data.choices?.[0]?.message?.content || buildFallbackReply(userInput);
  } catch (error) {
    console.warn('AI provider failed, using fallback:', error.message);
    return buildFallbackReply(userInput);
  }
}

module.exports = {
  DEFAULT_SYSTEM_PROMPT,
  buildFallbackReply,
  generateCreedReply,
  resolveModelConfig
};
