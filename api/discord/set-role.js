const { discordGet } = require('./_utils');
const { ADMIN_DISCORD_USER_ID, requireAdmin } = require('../_adminAuth');

const DISCORD_API = 'https://discord.com/api/v10';

async function discordMutate(method, path, botToken, body) {
  const response = await fetch(`${DISCORD_API}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) return {};
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`Discord API ${method} ${path} failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID || '1519033305473880149';
  const exemptUserIds = (process.env.DISCORD_EXEMPT_USER_IDS || '1308499431666094124')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

  if (!botToken) {
    return res.status(503).json({ error: 'DISCORD_BOT_TOKEN is not configured.' });
  }

  const { userId, roleId, action = 'add' } = req.body || {};
  if (!userId || !roleId) {
    return res.status(400).json({ error: 'Missing userId or roleId' });
  }

  if (exemptUserIds.includes(String(userId))) {
    return res.status(403).json({ error: 'This user cannot be modified from the website.' });
  }

  try {
    const roles = await discordGet(`/guilds/${guildId}/roles`, botToken);
    const targetRole = (roles || []).find(role => role.id === roleId);
    if (!targetRole || targetRole.managed || targetRole.name === '@everyone') {
      return res.status(400).json({ error: 'That role cannot be assigned from the website.' });
    }

    if (action === 'remove') {
      await discordMutate('DELETE', `/guilds/${guildId}/members/${userId}/roles/${roleId}`, botToken);
    } else {
      await discordMutate('PUT', `/guilds/${guildId}/members/${userId}/roles/${roleId}`, botToken);
    }

    const member = await discordGet(`/guilds/${guildId}/members/${userId}`, botToken);
    const roleNameMap = Object.fromEntries((roles || []).map(role => [role.id, role.name]));
    const roleNames = (member.roles || [])
      .map(id => roleNameMap[id])
      .filter(name => name && name !== '@everyone');

    return res.status(200).json({
      ok: true,
      userId,
      roleId,
      action,
      roleNames
    });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Unable to update member role.' });
  }
};
