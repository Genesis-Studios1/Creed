const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID || '1519033305473880149';
  const memberRoleId = process.env.DISCORD_MEMBER_ROLE_ID || '1519045618419368098';
  const exemptUserIds = (process.env.DISCORD_EXEMPT_USER_IDS || '1308499431666094124').split(',').map(x => x.trim()).filter(Boolean);

  if (!botToken) {
    return res.status(500).json({ error: 'DISCORD_BOT_TOKEN is not configured.' });
  }

  try {
    const membersRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const members = await membersRes.json();

    let assigned = 0;
    for (const member of members || []) {
      const userId = member.user?.id;
      if (!userId || exemptUserIds.includes(userId)) continue;
      const hasRole = Array.isArray(member.roles) && member.roles.includes(memberRoleId);
      if (!hasRole) {
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${memberRoleId}`, {
          method: 'PUT',
          headers: { Authorization: `Bot ${botToken}` }
        });
        assigned += 1;
      }
    }

    return res.status(200).json({ ok: true, assigned });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to sync member roles.' });
  }
};
