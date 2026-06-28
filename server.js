require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1519043591916490948';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const GUILD_ID = process.env.DISCORD_GUILD_ID || '1519033305473880149';
const MEMBER_ROLE_ID = process.env.DISCORD_MEMBER_ROLE_ID || '1519045618419368098';
const EXEMPT_USER_IDS = (process.env.DISCORD_EXEMPT_USER_IDS || '1308499431666094124').split(',').map(x => x.trim()).filter(Boolean);
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const activeWebsiteUsers = new Map();

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
  res.json({ count: activeWebsiteUsers.size, sessions: Array.from(activeWebsiteUsers.values()) });
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

    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const guildsData = await guildsRes.json();
    const guildCount = Array.isArray(guildsData) ? guildsData.length : 0;

    res.json({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar,
      guildCount,
      guilds: Array.isArray(guildsData) ? guildsData : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unknown error during OAuth exchange.' });
  }
});

app.get('/api/discord/stats', async (req, res) => {
  try {
    const guild = await discordRequest('GET', `/guilds/${GUILD_ID}`);
    const botGuilds = await discordRequest('GET', '/users/@me/guilds');

    res.json({
      guildId: GUILD_ID,
      memberCount: guild.approximate_member_count || 0,
      onlineCount: guild.approximate_presence_count || 0,
      botGuilds: Array.isArray(botGuilds) ? botGuilds.length : 0,
      guildName: guild.name || 'Creed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to load Discord stats.' });
  }
});

app.get('/api/discord/members', async (req, res) => {
  try {
    const roles = await discordRequest('GET', `/guilds/${GUILD_ID}/roles`);
    const roleNameMap = Object.fromEntries((roles || []).map(role => [role.id, role.name]));
    const members = await discordRequest('GET', `/guilds/${GUILD_ID}/members?limit=1000`);

    const normalized = (members || []).map(member => ({
      id: member.user?.id || member.id,
      username: member.user?.username || 'Unknown',
      nickname: member.nick || member.user?.global_name || '',
      displayName: member.nick || member.user?.global_name || member.user?.username || 'Unknown',
      avatar: member.user?.avatar,
      roles: Array.isArray(member.roles) ? member.roles : [],
      roleNames: (Array.isArray(member.roles) ? member.roles : []).map(roleId => roleNameMap[roleId] || roleId),
      isOwner: member.user?.id === process.env.DISCORD_OWNER_ID || member.user?.id === '1308499431666094124'
    }));

    res.json({ members: normalized });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to load guild members.' });
  }
});

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
