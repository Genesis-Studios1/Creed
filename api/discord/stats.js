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
    const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const guild = await guildRes.json();

    const botGuildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const botGuilds = await botGuildsRes.json();

    return res.status(200).json({
      guildId,
      memberCount: guild?.approximate_member_count || 0,
      onlineCount: guild?.approximate_presence_count || 0,
      botGuilds: Array.isArray(botGuilds) ? botGuilds.length : 0,
      guildName: guild?.name || 'Creed'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to load Discord stats.' });
  }
};
