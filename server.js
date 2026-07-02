require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const { generateCreedReply } = require('./ai/chatService');
const { getDiscordStats } = require('./api/discord/_utils');
const { incrementWebsiteMessage, setBotReportedMessages } = require('./api/_messageStore');
const rolesHandler = require('./api/discord/roles');
const setRoleHandler = require('./api/discord/set-role');
const membersHandler = require('./api/discord/members');
const botStatsHandler = require('./api/bot/stats');
const { createSessionCookieValue, parseSessionCookieValue } = require('./api/auth/_session');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1519043591916490948';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const GUILD_ID = process.env.DISCORD_GUILD_ID || '1519033305473880149';
const MEMBER_ROLE_ID = process.env.DISCORD_MEMBER_ROLE_ID || '1519045618419368098';
const EXEMPT_USER_IDS = (process.env.DISCORD_EXEMPT_USER_IDS || '1308499431666094124').split(',').map(x => x.trim()).filter(Boolean);
const DASHBOARD_PASSWORD = process.env.CREED_ADMIN_PASSWORD || 'Creed2026!';
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const activeWebsiteUsers = new Map();
const knownWebsiteUsers = new Map();

console.log('--- Creed local server startup ---');
console.log(`Loaded DISCORD_CLIENT_ID: ${CLIENT_ID}`);
console.log(`DISCORD_CLIENT_SECRET loaded: ${CLIENT_SECRET ? 'yes' : 'no'}${CLIENT_SECRET ? ` (length ${CLIENT_SECRET.length})` : ''}`);
console.log(`DISCORD_BOT_TOKEN loaded: ${BOT_TOKEN ? 'yes' : 'no'}`);
console.log(`Loaded DISCORD_REDIRECT_URI: ${REDIRECT_URI}`);
console.log('----------------------------------');

app.use(express.static(path.join(__dirname)));

function cleanupWebsiteUsers() {
  const now = Date.now();
  for (const [sessionId, entry] of activeWebsiteUsers.entries()) {
    if (now - entry.lastSeen > 120000) activeWebsiteUsers.delete(sessionId);
  }
}

function getSessionCookieValue(req) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|; )creed_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setSessionCookie(res, sessionId) {
  res.cookie('creed_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/'
  });
}

function clearSessionCookie(res) {
  res.clearCookie('creed_session', { path: '/' });
}

function recordKnownUser(userData, source = 'unknown') {
  if (!userData || !userData.id) return null;

  const normalized = {
    id: String(userData.id),
    username: userData.username || 'User',
    discriminator: userData.discriminator || '0000',
    avatarUrl: userData.avatarUrl || null,
    role: userData.role || 'member',
    serverRole: userData.serverRole || 'Member',
    lastSeen: userData.lastSeen || Date.now(),
    lastLoginAt: userData.lastLoginAt || new Date().toISOString(),
    source
  };

  knownWebsiteUsers.set(normalized.id, normalized);
  return normalized;
}

setInterval(cleanupWebsiteUsers, 30000);

async function discordRequest(method, endpoint, body) {
  if (!BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN is not configured.');
  }

  const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!response.ok) {
    throw new Error(`Discord API ${method} ${endpoint} failed (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

app.get('/auth/discord/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'auth-callback.html'));
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body || {};
  if (!password || password !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Incorrect password.' });
  }

  const user = {
    id: 'dashboard-owner',
    username: 'Owner',
    discriminator: '0001',
    avatar: null,
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
    role: 'owner',
    serverRole: 'Owner',
    lastLoginAt: new Date().toISOString(),
    loggedInAt: new Date().toISOString()
  };

  const sessionValue = createSessionCookieValue(user);
  recordKnownUser(user, 'password');
  setSessionCookie(res, sessionValue);
  return res.json({ ok: true, user, sessionId: sessionValue });
});

app.post('/api/auth/record-login', (req, res) => {
  const user = req.body || {};
  if (!user || !user.id) {
    return res.status(400).json({ ok: false, error: 'Missing user details.' });
  }

  const sessionValue = createSessionCookieValue({ ...user, lastLoginAt: user.lastLoginAt || new Date().toISOString() });
  const recorded = recordKnownUser({ ...user, lastLoginAt: user.lastLoginAt || new Date().toISOString() }, 'discord');
  setSessionCookie(res, sessionValue);
  return res.json({ ok: true, user: recorded, sessionId: sessionValue });
});

app.post('/api/website/heartbeat', (req, res) => {
  const { sessionId, userId } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  activeWebsiteUsers.set(sessionId, { sessionId, userId: userId || null, lastSeen: Date.now() });
  cleanupWebsiteUsers();
  res.json({ ok: true, count: activeWebsiteUsers.size });
});

app.get('/api/website/stats', (req, res) => {
  cleanupWebsiteUsers();
  const users = Array.from(knownWebsiteUsers.values()).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  res.json({ count: activeWebsiteUsers.size, sessions: Array.from(activeWebsiteUsers.values()), users });
});

app.get('/api/auth/me', (req, res) => {
  const sessionValue = getSessionCookieValue(req);
  if (!sessionValue) {
    return res.status(401).json({ ok: false, authenticated: false });
  }

  const parsed = parseSessionCookieValue(sessionValue);
  if (!parsed?.user) {
    return res.status(401).json({ ok: false, authenticated: false });
  }

  const user = Array.from(knownWebsiteUsers.values()).find((entry) => entry.id === String(parsed.user.id));
  if (!user) {
    return res.status(401).json({ ok: false, authenticated: false });
  }

  return res.json({ ok: true, authenticated: true, user });
});

app.post('/api/auth/logout', (req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages = [] } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing messages array.' });
    }

    incrementWebsiteMessage();
    const result = await generateCreedReply({ messages });
    return res.status(200).json({
      reply: result.reply || result,
      usedFallback: Boolean(result.usedFallback),
      provider: result.provider || 'none',
      model: result.model || 'fallback',
      error: result.error || null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to generate AI response.' });
  }
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth code.' });
  }

  if (!CLIENT_SECRET) {
    return res.status(500).json({ error: 'DISCORD_CLIENT_SECRET is not configured.' });
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: tokenData });
    }

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userRes.json();
    if (!userRes.ok) {
      return res.status(userRes.status).json({ error: userData });
    }

    res.json({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unknown error during OAuth exchange.' });
  }
});

app.get('/api/discord/stats', async (req, res) => {
  try {
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'DISCORD_BOT_TOKEN is not configured.' });
    }
    const stats = await getDiscordStats(BOT_TOKEN, GUILD_ID);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to load Discord stats.' });
  }
});

app.get('/api/discord/roles', (req, res) => rolesHandler(req, res));
app.post('/api/discord/set-role', (req, res) => setRoleHandler(req, res));
app.get('/api/discord/members', (req, res) => membersHandler(req, res));
app.post('/api/bot/stats', (req, res) => botStatsHandler(req, res));

app.post('/api/discord/ban', async (req, res) => {
  try {
    const { userId, reason } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    await discordRequest('PUT', `/guilds/${GUILD_ID}/bans/${userId}`, { delete_message_days: 0, reason: reason || 'Banned from admin panel' });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to ban user.' });
  }
});

app.post('/api/discord/timeout', async (req, res) => {
  try {
    const { userId, minutes, reason } = req.body || {};
    if (!userId || !minutes) return res.status(400).json({ error: 'Missing userId or minutes' });
    const until = new Date(Date.now() + parseInt(minutes, 10) * 60000).toISOString();
    await discordRequest('PATCH', `/guilds/${GUILD_ID}/members/${userId}`, { communication_disabled_until: until, reason: reason || 'Timed out from admin panel' });
    res.json({ ok: true, until });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to timeout user.' });
  }
});

app.post('/api/discord/sync-member-role', async (req, res) => {
  try {
    const members = await discordRequest('GET', `/guilds/${GUILD_ID}/members?limit=1000`);
    let assigned = 0;

    for (const member of members || []) {
      const userId = member.user?.id;
      if (!userId || EXEMPT_USER_IDS.includes(userId)) continue;
      const hasRole = Array.isArray(member.roles) && member.roles.includes(MEMBER_ROLE_ID);
      if (!hasRole) {
        await discordRequest('PUT', `/guilds/${GUILD_ID}/members/${userId}/roles/${MEMBER_ROLE_ID}`);
        assigned += 1;
      }
    }

    res.json({ ok: true, assigned });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to sync member roles.' });
  }
});

app.listen(PORT, () => {
  console.log(`Creed Bot Website local server running at http://localhost:${PORT}`);
  console.log(`Discord redirect URI: ${REDIRECT_URI}`);
});
