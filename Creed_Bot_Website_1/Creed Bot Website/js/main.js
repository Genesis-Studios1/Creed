/* ═══════════════════════════════════════════
   MAIN.JS — Landing page interactions
   ═══════════════════════════════════════════ */

// ── Nav scroll effect ──
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

// ── Discord OAuth2 — opens Discord's login page directly ──
function launchDiscordOAuth() {
  const CLIENT_ID    = '1519043591916490948';

  // This must match EXACTLY what you add in the Discord Developer Portal
  // Go to: https://discord.com/developers/applications/1519043591916490948/oauth2
  // Under "Redirects", add the URL of your auth-callback page.
  // If opening locally as a file, use the full file path below.
  // If hosted on a domain, replace with: 'https://yourdomain.com/pages/auth-callback.html'
  const REDIRECT_URI = window.location.origin + '/pages/auth-callback.html';

  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'identify guilds',
    prompt:        'none'   // skips re-auth screen if already approved before
  });

  // Redirect the user to Discord's authorization page
  window.location.href = 'https://discord.com/api/oauth2/authorize?' + params.toString();
}

// ── Animated number counters ──
function animateNum(el) {
  const target = parseFloat(el.dataset.to);
  const dec    = parseInt(el.dataset.dec || 0);
  const suffix = el.dataset.suffix || '';
  const dur    = 1800;
  const start  = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / dur, 1);
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
