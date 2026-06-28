/* ═══════════════════════════════════════════
   MAIN.JS
   ═══════════════════════════════════════════ */

const CLIENT_ID = '1519043591916490948';
const REDIRECT_PATH = '/auth/discord/callback';
const REDIRECT_URI = `${window.location.origin}${REDIRECT_PATH}`;
const OAUTH_SCOPE = 'identify';
const SERVER_ID = '1519033305473880149';
const SERVER_NAME = 'Creed Server';

function getSavedUser() {
  try { return JSON.parse(localStorage.getItem('creed_user') || 'null'); } catch { return null; }
}

let websiteHeartbeatTimer = null;
let websiteSessionId = null;

function getWebsiteSessionId() {
  if (websiteSessionId) return websiteSessionId;
  const saved = sessionStorage.getItem('creed_session_id');
  if (saved) {
    websiteSessionId = saved;
    return websiteSessionId;
  }
  websiteSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem('creed_session_id', websiteSessionId);
  return websiteSessionId;
}

async function heartbeatWebsite() {
  try {
    const sessionId = getWebsiteSessionId();
    const user = getSavedUser();
    await fetch('/api/website/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId: user?.id || null })
    });
  } catch (error) {
    console.warn('Heartbeat failed', error);
  }
}

function getOnlineUsers() {
  try { return JSON.parse(localStorage.getItem('creed_online_users') || '[]'); } catch { return []; }
}

function saveOnlineUsers(users) {
  localStorage.setItem('creed_online_users', JSON.stringify(users));
}

function getServerStats() {
  const defaults = {
    serverId: SERVER_ID,
    serverName: SERVER_NAME,
    discordMembers: 0,
    botUsers: 0,
    discordOnline: 0,
    botServers: 0,
    roleCount: 0,
    websiteLogins: 0,
    messagesSent: 0
  };
  try {
    const saved = JSON.parse(localStorage.getItem('creed_server_stats') || 'null');
    if (saved) return { ...defaults, ...saved };
  } catch {}
  return defaults;
}

function formatStatNumber(value, dec = 0, suffix = '') {
  const num = Number(value) || 0;
  return num.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
}

function setLiveStat(statName, value) {
  document.querySelectorAll(`[data-stat="${statName}"]`).forEach(el => {
    const dec = parseInt(el.dataset.dec || '0', 10);
    const suffix = el.dataset.suffix || '';
    el.dataset.to = String(value);
    el.textContent = formatStatNumber(value, dec, suffix);
    el.dataset.animated = 'true';
  });
}

function applyLiveStats(stats) {
  setLiveStat('servers', stats.botServers);
  setLiveStat('members', stats.memberCount);
  setLiveStat('messages', stats.messagesSent);
  setLiveStat('logins', stats.websiteLogins);

  localStorage.setItem('creed_server_stats', JSON.stringify({
    serverId: SERVER_ID,
    serverName: stats.guildName || SERVER_NAME,
    discordMembers: stats.memberCount,
    discordOnline: stats.onlineCount,
    botServers: stats.botServers,
    roleCount: stats.roleCount,
    websiteLogins: stats.websiteLogins,
    messagesSent: stats.messagesSent
  }));
}

function updateNavUI() {
  const user = getSavedUser();
  const adminBtn = document.getElementById('adminPanelBtn');
  const loginBtn = document.getElementById('loginButton');
  const loginBtnMobile = document.getElementById('loginButtonMobile');
  const profileMenu = document.getElementById('profileMenu');

  if (user) {
    if (adminBtn) adminBtn.style.display = isOwner(user) ? 'inline-flex' : 'none';
    if (loginBtn) loginBtn.style.display = 'none';
    if (loginBtnMobile) loginBtnMobile.style.display = 'none';
    if (profileMenu) profileMenu.style.display = 'inline-flex';
    const avatar = document.getElementById('navProfileAvatar');
    const navName = document.getElementById('navProfileName');
    if (avatar) avatar.src = user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0', 10) % 5}.png`;
    if (navName) navName.textContent = `${user.username || 'User'}#${user.discriminator || '0000'}`;
  } else {
    if (adminBtn) adminBtn.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (loginBtnMobile) loginBtnMobile.style.display = 'inline-flex';
    if (profileMenu) profileMenu.style.display = 'none';
  }
}

function toggleProfileDropdown() {
  const dropdown = document.getElementById('profileDropdown');
  if (!dropdown) return;
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function getWebsiteOnlineCount() {
  try {
    const users = JSON.parse(localStorage.getItem('creed_online_users') || '[]');
    return Array.isArray(users) ? users.length : 0;
  } catch {
    return 0;
  }
}

function getDiscordOnlineCount() {
  const stats = getServerStats();
  return stats.discordOnline || 0;
}

function getBotServerCount() {
  const stats = getServerStats();
  return stats.botServers || 0;
}

document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('profileDropdown');
  const avatar = document.getElementById('navProfileAvatar');
  if (!dropdown || !avatar) return;
  if (event.target === avatar || avatar.contains(event.target)) return;
  if (dropdown.contains(event.target)) return;
  dropdown.style.display = 'none';
});

function updateProfileUI() {
  const user = getSavedUser();
  const profileCard = document.getElementById('heroProfileCard');
  if (!profileCard) return;

  if (!user) {
    profileCard.style.display = 'none';
    return;
  }

  const guildCount = user.guildCount ?? getOnlineUsers().length;
  const avatar = document.getElementById('heroProfileAvatar');
  const name = document.getElementById('heroProfileName');
  const role = document.getElementById('heroProfileRole');
  const discordId = document.getElementById('heroDiscordId');
  const lastLogin = document.getElementById('heroLastLogin');
  const guildCountEl = document.getElementById('heroGuildCount');

  if (avatar) {
    avatar.src = user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0', 10) % 5}.png`;
    avatar.alt = user.username || 'Creed profile';
  }
  if (name) name.textContent = `${user.username || 'Guest'}#${user.discriminator || '0000'}`;
  if (role) role.textContent = user.serverRole || 'Member';
  if (discordId) discordId.textContent = user.id || '—';
  if (lastLogin) lastLogin.textContent = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—';
  if (guildCountEl) guildCountEl.textContent = guildCount.toLocaleString();

  profileCard.style.display = 'block';
}

function handleLogout() {
  const user = getSavedUser();
  if (user) {
    const remaining = getOnlineUsers().filter(u => u.id !== user.id);
    saveOnlineUsers(remaining);
  }
  localStorage.removeItem('creed_user');
  localStorage.removeItem('creed_guilds');
  updateNavUI();
  updateProfileUI();
  window.location.reload();
}

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
  document.getElementById('redirectUriBox').style.display = 'none';
  genCaptcha();
}
function closeLoginModal() {
  document.getElementById('loginBackdrop').classList.remove('open');
}
function closeIfBackdrop(e, id) {
  if (e.target.id === id) document.getElementById(id).classList.remove('open');
}

// ── Discord OAuth2 ──
function launchDiscordOAuth() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: OAUTH_SCOPE,
    prompt: 'consent'
  });

  window.location.href = 'https://discord.com/api/oauth2/authorize?' + params.toString();
}

// Called by the "Continue with Discord" button after captcha passes
function handleDiscordContinue() {
  const redirectBox = document.getElementById('redirectUriBox');
  if (redirectBox) {
    redirectBox.style.display = 'block';
    redirectBox.textContent = REDIRECT_URI;
  }
  launchDiscordOAuth();
}

// ── Number counters ──
function animateNum(el) {
  if (el.dataset.animated === 'true') return;
  const target = parseFloat(el.dataset.to);
  if (!Number.isFinite(target)) return;
  const dec    = parseInt(el.dataset.dec || 0, 10);
  const suffix = el.dataset.suffix || '';
  const dur    = 1800;
  const start  = performance.now();
  function frame(now) {
    const p    = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = formatStatNumber(target * ease, dec, suffix);
    if (p < 1) requestAnimationFrame(frame);
    else el.dataset.animated = 'true';
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

document.addEventListener('DOMContentLoaded', async () => {
  updateNavUI();
  updateProfileUI();
  heartbeatWebsite();
  if (websiteHeartbeatTimer) clearInterval(websiteHeartbeatTimer);
  websiteHeartbeatTimer = setInterval(heartbeatWebsite, 30000);
  await refreshStats();
  setInterval(refreshStats, 30000);
});

async function refreshStats() {
  let websiteLogins = 0;

  try {
    const websiteRes = await fetch('/api/website/stats');
    if (websiteRes.ok) {
      const websiteData = await websiteRes.json();
      const sessions = Array.isArray(websiteData.sessions) ? websiteData.sessions : [];
      websiteLogins = sessions.length;
      saveOnlineUsers(sessions.map(s => ({
        id: s.userId || s.sessionId,
        sessionId: s.sessionId,
        lastSeen: s.lastSeen,
        userId: s.userId || null
      })));
    }
  } catch (error) {
    console.warn('Website stats refresh failed', error);
  }

  try {
    const discordRes = await fetch('/api/discord/stats', { cache: 'no-store' });
    if (discordRes.ok) {
      const discordData = await discordRes.json();
      if (discordData.configured === false) {
        console.warn('Discord stats unavailable: bot token not configured on server.');
        return;
      }
      applyLiveStats({
        botServers: discordData.botGuilds || 0,
        memberCount: discordData.memberCount || 0,
        onlineCount: discordData.onlineCount || 0,
        roleCount: discordData.roleCount || 0,
        messagesSent: discordData.messagesSent || 0,
        websiteLogins,
        guildName: discordData.guildName || SERVER_NAME
      });
      return;
    }

    const errorBody = await discordRes.json().catch(() => ({}));
    console.warn('Discord stats request failed', discordRes.status, errorBody.error || '');
  } catch (error) {
    console.warn('Discord stats refresh failed', error);
  }

  const saved = getServerStats();
  applyLiveStats({
    botServers: saved.botServers || 0,
    memberCount: saved.discordMembers || 0,
    onlineCount: saved.discordOnline || 0,
    roleCount: saved.roleCount || 0,
    messagesSent: saved.messagesSent || 0,
    websiteLogins,
    guildName: saved.serverName || SERVER_NAME
  });
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) heartbeatWebsite();
});
