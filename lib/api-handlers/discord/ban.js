const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID || '1519033305473880149';
  const { userId, reason } = req.body || {};

  if (!botToken || !userId) {
    return res.status(400).json({ error: 'Missing bot token or userId.' });
  }

  try {
    await fetch(`https://discord.com/api/v10/guilds/${guildId}/bans/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ delete_message_days: 0, reason: reason || 'Banned from admin panel' })
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to ban user.' });
  }
};
