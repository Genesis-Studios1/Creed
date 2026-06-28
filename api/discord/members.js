const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID || '1519033305473880149';

  if (!botToken) {
    return res.status(500).json({ error: 'DISCORD_BOT_TOKEN is not configured.' });
  }

  try {
    const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const roles = await rolesRes.json();
    const roleNameMap = Object.fromEntries((roles || []).map(role => [role.id, role.name]));

    const membersRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const members = await membersRes.json();

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

    return res.status(200).json({ members: normalized });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to load guild members.' });
  }
};
