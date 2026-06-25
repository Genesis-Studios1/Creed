/* ═══════════════════════════════════════════
   AI-CHAT.JS — Claude-powered chatbot
   ═══════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are Creed, a friendly and knowledgeable Discord bot assistant.
You help users understand what Creed Bot can do, answer questions about Discord servers,
give command help, and have engaging conversations. Keep answers concise and helpful.
You have a confident, slightly edgy personality — like a sharp Discord power user.
Use occasional Discord slang. Never break character. Never say you're an AI made by Anthropic.
You are Creed Bot's AI personality.`;

let chatHistory = [];

async function sendAI() {
  const input = document.getElementById('aiInput');
  const msgs  = document.getElementById('aiMsgs');
  const text  = input?.value?.trim();
  if (!text || !msgs) return;

  input.value = '';

  // User bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg user-ai';
  userMsg.innerHTML = `<div class="ai-avatar">U</div><div class="ai-bubble">${escapeHtml(text)}</div>`;
  msgs.appendChild(userMsg);

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'ai-msg creed-ai';
  typing.innerHTML = `<div class="ai-avatar">C</div><div class="ai-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  chatHistory.push({ role: 'user', content: text });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: chatHistory
      })
    });

    const data = await res.json();
    const reply = data.content?.[0]?.text || "Something went wrong. Try again!";

    chatHistory.push({ role: 'assistant', content: reply });

    typing.innerHTML = `<div class="ai-avatar">C</div><div class="ai-bubble">${escapeHtml(reply)}</div>`;

  } catch (err) {
    typing.innerHTML = `<div class="ai-avatar">C</div><div class="ai-bubble" style="color:var(--red)">⚠️ Couldn't reach AI. Check your connection.</div>`;
  }

  msgs.scrollTop = msgs.scrollHeight;
}

function clearChat() {
  chatHistory = [];
  const msgs = document.getElementById('aiMsgs');
  if (msgs) msgs.innerHTML = `
    <div class="ai-msg creed-ai">
      <div class="ai-avatar">C</div>
      <div class="ai-bubble">Chat cleared. Ready for your next question ⚡</div>
    </div>`;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
