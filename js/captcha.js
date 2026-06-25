/* ═══════════════════════════════════════════
   CAPTCHA.JS — Canvas-rendered CAPTCHA
   ═══════════════════════════════════════════ */

let _captchaText = '';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

function genCaptcha() {
  _captchaText = Array.from({ length: 6 }, randChar).join('');
  renderCaptcha(_captchaText);
  const inp = document.getElementById('captchaInput');
  const err = document.getElementById('captchaErr');
  if (inp) inp.value = '';
  if (err) err.textContent = '';
}

function renderCaptcha(text) {
  const container = document.getElementById('captchaDisplay');
  if (!container) return;

  // Build an SVG CAPTCHA with noise
  const chars = text.split('').map((ch, i) => {
    const x = 22 + i * 32;
    const y = 38 + (Math.random() * 14 - 7);
    const rot = (Math.random() * 24 - 12);
    const colors = ['#00ff88', '#00e67a', '#1affaa', '#00cc6e'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const size = 22 + Math.random() * 6;
    return `<text x="${x}" y="${y}" transform="rotate(${rot},${x},${y})"
      font-family="monospace" font-size="${size}" font-weight="bold"
      fill="${col}" opacity="0.92">${ch}</text>`;
  }).join('');

  // Noise lines
  let lines = '';
  for (let i = 0; i < 6; i++) {
    const x1 = Math.random() * 220, y1 = Math.random() * 70;
    const x2 = Math.random() * 220, y2 = Math.random() * 70;
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="rgba(0,255,136,0.18)" stroke-width="${Math.random()*2+0.5}"/>`;
  }
  // Noise dots
  let dots = '';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 220, y = Math.random() * 70, r = Math.random() * 2;
    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(0,255,136,0.2)"/>`;
  }

  container.innerHTML = `
    <svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <rect width="220" height="70" fill="#060b07"/>
      ${lines}${dots}${chars}
    </svg>`;
}

function verifyCaptcha() {
  const input = document.getElementById('captchaInput')?.value?.trim().toUpperCase();
  const err   = document.getElementById('captchaErr');
  if (!input) { if (err) err.textContent = 'Please enter the characters shown.'; return; }
  if (input !== _captchaText) {
    if (err) err.textContent = 'Incorrect. Try again.';
    genCaptcha();
    return;
  }
  // Passed
  document.getElementById('captchaStep').style.display = 'none';
  document.getElementById('discordStep').style.display = 'block';
}

// Init on load if modal exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('captchaDisplay')) genCaptcha();
});
