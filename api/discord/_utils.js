const DISCORD_API = 'https://discord.com/api/v10';
const STATS_CACHE_TTL_MS = 45000;
const MAX_GUILD_PAGES = 10;
const { getTotalMessages } = require('../_messageStore');

let statsCache = null;
let statsCacheAt = 0;

async function discordGet(path, botToken) {
  const response = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bot ${botToken}` }
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`Discord API GET ${path} failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function getBotGuildCount(botToken) {
  let count = 0;
  let after = null;
  let pages = 0;

  while (pages < MAX_GUILD_PAGES) {
    const params = new URLSearchParams({ limit: '200' });
    if (after) params.set('after', after);
    const guilds = await discordGet(`/users/@me/guilds?${params}`, botToken);
    if (!Array.isArray(guilds) || guilds.length === 0) break;
    count += guilds.length;
    pages += 1;
    if (guilds.length < 200) break;
    after = guilds[guilds.length - 1].id;
  }

  return count;
}

async function getGuildMembers(botToken, guildId) {
  const members = [];
  let after = null;
  let page = 0;

  while (page < MAX_GUILD_PAGES) {
    const params = new URLSearchParams({ limit: '1000' });
    if (after) params.set('after', after);
    const pageMembers = await discordGet(`/guilds/${guildId}/members?${params.toString()}`, botToken);
    if (!Array.isArray(pageMembers) || pageMembers.length === 0) break;

    members.push(...pageMembers);
    if (pageMembers.length < 1000) break;

    after = pageMembers[pageMembers.length - 1].user?.id || pageMembers[pageMembers.length - 1].id;
    page += 1;
  }

  return members;
}

async function getDiscordStats(botToken, guildId, { useCache = true } = {}) {
  if (useCache && statsCache && Date.now() - statsCacheAt < STATS_CACHE_TTL_MS) {
    return statsCache;
  }

  const guild = await discordGet(`/guilds/${guildId}?with_counts=true`, botToken);

  const [botGuilds, roles] = await Promise.all([
    getBotGuildCount(botToken).catch(() => 0),
    discordGet(`/guilds/${guildId}/roles`, botToken).catch(() => [])
  ]);

  const stats = {
    guildId,
    memberCount: guild.approximate_member_count || 0,
    onlineCount: guild.approximate_presence_count || 0,
    botGuilds: typeof botGuilds === 'number' ? botGuilds : 0,
    roleCount: Array.isArray(roles) ? roles.filter(r => r.name !== '@everyone').length : 0,
    messagesSent: getTotalMessages(),
    guildName: guild.name || 'Creed',
    updatedAt: Date.now()
  };

  statsCache = stats;
  statsCacheAt = Date.now();
  return stats;
}

module.exports = { discordGet, getBotGuildCount, getDiscordStats, getGuildMembers };
