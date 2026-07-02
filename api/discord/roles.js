const { discordGet } = require('./_utils');

function isAssignableRole(role) {
  if (!role || role.managed) return false;
  if (role.name === '@everyone') return false;
  return true;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID || '1519033305473880149';

  if (!botToken) {
    return res.status(503).json({ error: 'DISCORD_BOT_TOKEN is not configured.' });
  }

  try {
    const roles = await discordGet(`/guilds/${guildId}/roles`, botToken);
    const assignable = (roles || [])
      .filter(isAssignableRole)
      .sort((a, b) => b.position - a.position)
      .map(role => ({
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position
      }));

    return res.status(200).json({ roles: assignable });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Unable to load guild roles.' });
  }
};
