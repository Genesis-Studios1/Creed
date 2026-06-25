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
// REDIRECT_URI must match EXACTLY what you entered in the Discord Developer Portal.
// See the box that pops up in the modal for the exact URL to copy.
function launchDiscordOAuth() {
  const CLIENT_ID = '1519043591916490948';

  // Build the redirect URI from where the site is actually running right now.
  // Whatever this produces is what you need to add in the Discord Portal → Redirects.
  const REDIRECT_URI = buildRedirectURI();

  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'identify',
    prompt:        'consent'
  });

  window.location.href = 'https://discord.com/api/oauth2/authorize?' + params.toString();
}

function buildRedirectURI() {
  const loc = window.location;

  // Hosted on a real domain (http:// or https://)
  if (loc.protocol === 'http:' || loc.protocol === 'https:') {
    return loc.origin + '/pages/auth-callback.html';
  }

  // Opened as a local file (file://) — Discord won't accept file:// URIs.
  // User must host locally with a simple server. Show them how.
  return null;
}

// Called when "Continue with Discord" button is clicked
// Shows the exact redirect URI they need to add in the portal
function handleDiscordContinue() {
  const uri = buildRedirectURI();
  const infoBox = document.getElementById('redirectUriBox');
  const uriDisplay = document.getElementById('redirectUriDisplay');

  if (!uri) {
    // file:// mode — can't do OAuth, show instructions
    infoBox.style.display = 'block';
    infoBox.innerHTML = `
      <div style="background:rgba(255,77,106,0.1);border:1px solid rgba(255,77,106,0.3);border-radius:10px;padding:14px;font-size:13px;line-height:1.7;text-align:left;">
        <strong style="color:#ff6b84;">⚠️ You're opening this as a local file</strong><br/>
        Discord OAuth2 doesn't work with <code>file://</code> URLs.<br/><br/>
        <strong>Quick fix — run a local server:</strong><br/>
        1. Open a terminal in the <em>Creed Bot Website</em> folder<br/>
        2. Run: <code>npx serve .</code> (needs Node.js) <em>or</em> <code>python -m http.server 8080</code><br/>
        3. Open <code>http://localhost:8080</code> in your browser<br/>
        4. Then add <code>http://localhost:8080/pages/auth-callback.html</code> as a Redirect in the Discord Portal
      </div>`;
    return;
  }

  // Show the URI they need to whitelist
  if (uriDisplay) uriDisplay.textContent = uri;
  if (infoBox) infoBox.style.display = 'block';

  // Proceed to Discord
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
