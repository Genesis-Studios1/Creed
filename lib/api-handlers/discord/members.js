const { discordGet, getGuildMembers } = require('./_utils');

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
    const [roles, members] = await Promise.all([
      discordGet(`/guilds/${guildId}/roles`, botToken),
      getGuildMembers(botToken, guildId)
    ]);

    const roleNameMap = Object.fromEntries((roles || []).map(role => [role.id, role.name]));

    const normalized = (members || []).map(member => ({
      id: member.user?.id || member.id,
      username: member.user?.username || 'Unknown',
      discriminator: member.user?.discriminator || '0000',
      nickname: member.nick || member.user?.global_name || '',
      displayName: member.nick || member.user?.global_name || member.user?.username || 'Unknown',
      avatarUrl: member.user?.avatar
        ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(member.user?.discriminator || '0', 10) % 5}.png?size=64`,
      roles: Array.isArray(member.roles) ? member.roles : [],
      roleNames: (Array.isArray(member.roles) ? member.roles : [])
        .map(roleId => roleNameMap[roleId] || roleId)
        .filter(name => name && name !== '@everyone'),
      isOwner: member.user?.id === process.env.DISCORD_OWNER_ID || member.user?.id === '1308499431666094124'
    }));

    return res.status(200).json({ members: normalized });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Unable to load guild members.' });
  }
};
