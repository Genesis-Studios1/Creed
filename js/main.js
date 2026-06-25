/* ═══════════════════════════════════════════
   MAIN.JS
   ═══════════════════════════════════════════ */

// ── Nav scroll ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 40);
});

function toggleNav() {
  document.getElementById('navMobile')?.classList.toggle('open');
}

// ── Login modal ──
function openLoginModal() {
  document.getElementById('loginBackdrop').classList.add('open');
  document.getElementById('captchaStep').style.display = 'block';
  document.getElementById('discordStep').style.display = 'none';
  genCaptcha();
}
function closeLoginModal() {
  document.getElementById('loginBackdrop').classList.remove('open');
}
function closeIfBackdrop(e, id) {
  if (e.target.id === id) document.getElementById(id).classList.remove('open');
}

// ── Discord OAuth2 ──
// Redirect URI is hardcoded to match exactly what's in the Discord Portal
function launchDiscordOAuth() {
  const CLIENT_ID    = '1519043591916490948';
  const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback';

  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'identify',
    prompt:        'consent'
  });

  window.location.href = 'https://discord.com/api/oauth2/authorize?' + params.toString();
}

// Called by the "Continue with Discord" button after captcha passes
function handleDiscordContinue() {
  launchDiscordOAuth();
}

// ── Number counters ──
function animateNum(el) {
  const target = parseFloat(el.dataset.to);
  const dec    = parseInt(el.dataset.dec || 0);
  const suffix = el.dataset.suffix || '';
  const dur    = 1800;
  const start  = performance.now();
  function frame(now) {
    const p    = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * ease).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const numObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-to]').forEach(animateNum);
      numObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.hero-trust, .stats-inner').forEach(el => numObserver.observe(el));

// ── Toast ──
function showToast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
