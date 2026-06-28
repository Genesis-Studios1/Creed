/* ═══════════════════════════════════════════
   AI-CHAT.JS — Creed chatbot frontend
   ═══════════════════════════════════════════ */

let chatHistory = [];

async function sendAI() {
  const input = document.getElementById('aiInput');
  const msgs  = document.getElementById('aiMsgs');
  const text  = input?.value?.trim();
  if (!text || !msgs) return;

  input.value = '';

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

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory })
    });

    const data = await res.json();
    const reply = data.reply || "Something went wrong. Try again!";

    chatHistory.push({ role: 'assistant', content: reply });
    typing.innerHTML = `<div class="ai-avatar">C</div><div class="ai-bubble">${escapeHtml(reply)}</div>`;
  } catch (err) {
    typing.innerHTML = `<div class="ai-avatar">C</div><div class="ai-bubble" style="color:var(--red)">⚠️ Couldn't reach the AI service. Try again in a moment.</div>`;
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
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
