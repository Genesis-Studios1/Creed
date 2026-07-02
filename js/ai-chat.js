/* Client-side AI fallback when the API is unavailable */
function clientAIFallback(text) {
  const lower = String(text || '').toLowerCase().trim();

  if (/^(hi|hey|hello|yo|sup|hiya|howdy)\b/.test(lower)) {
    return "Hey! 👋 I'm Creed AI. Ask me about bot commands, coding, or anything else!";
  }
  if (/how('re| are) you|how r u|what'?s up/.test(lower)) {
    return "Doing great! ⚡ What can I help you with today?";
  }
  if (/command|commands|\/ban|\/play|\/help|prefix/.test(lower)) {
    return "Creed Bot uses slash commands (/). Popular ones: /play, /ban, /kick, /mute, /daily, /ping, /serverinfo. Ask me about a specific command!";
  }
  if (/python|\.py/.test(lower)) {
    return "Run Python: open terminal in the folder and type `python filename.py`";
  }
  if (/node|\.js|npm/.test(lower)) {
    return "Run Node.js: `node filename.js` or `npm install` then `npm start` for projects.";
  }
  if (/html|website|browser/.test(lower)) {
    return "Open HTML in your browser, or run `npx serve .` for a local server.";
  }
  return "I'm Creed AI! I can help with bot commands, coding, and general questions. Try: \"list music commands\" or \"how do I run a Python file?\"";
}

async function sendAI() {
  const input = document.getElementById('aiInput');
  const msgs  = document.getElementById('aiMsgs');
  const text  = input?.value?.trim();
  if (!text || !msgs) return;

  input.value = '';
  input.disabled = true;

  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg user-ai';
  userMsg.innerHTML = `<div class="ai-avatar">U</div><div class="ai-bubble">${escapeHtml(text)}</div>`;
  msgs.appendChild(userMsg);

  const typing = document.createElement('div');
  typing.className = 'ai-msg creed-ai';
  typing.innerHTML = `<div class="ai-avatar">C</div><div class="ai-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  chatHistory.push({ role: 'user', content: text });

  let reply = clientAIFallback(text);
  let statusText = '';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      reply = data.reply || reply;
      statusText = data.usedFallback ? 'Using fallback response.' : `Powered by ${data.provider || 'AI'}.`;
    } else {
      const errorData = await res.json().catch(() => ({}));
      statusText = errorData.error || 'The AI service is temporarily unavailable.';
    }
  } catch (_) {
    statusText = 'The AI service is temporarily unavailable.';
  }

  chatHistory.push({ role: 'assistant', content: reply });
  typing.innerHTML = `<div class="ai-avatar">C</div><div class="ai-bubble">${formatReply(reply)}${statusText ? `<div style="margin-top:8px;font-size:11px;opacity:0.75;">${escapeHtml(statusText)}</div>` : ''}</div>`;
  msgs.scrollTop = msgs.scrollHeight;
  input.disabled = false;
  input.focus();
}

function formatReply(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function clearChat() {
  chatHistory = [];
  const msgs = document.getElementById('aiMsgs');
  if (msgs) msgs.innerHTML = `
    <div class="ai-msg creed-ai">
      <div class="ai-avatar">C</div>
      <div class="ai-bubble">Hey! I'm Creed AI. Ask me about bot commands, coding, or anything else ⚡</div>
    </div>`;
}

function initAIChat() {
  const input = document.getElementById('aiInput');
  if (input) {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendAI();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initAIChat);

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let chatHistory = [];
