const { requireAdmin } = require('../_adminAuth');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID || '1519033305473880149';
  const { userId, minutes, reason } = req.body || {};

  if (!botToken || !userId || !minutes) {
    return res.status(400).json({ error: 'Missing bot token, userId or minutes.' });
  }

  try {
    const until = new Date(Date.now() + parseInt(minutes, 10) * 60000).toISOString();
    await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ communication_disabled_until: until, reason: reason || 'Timed out from admin panel' })
    });
    return res.status(200).json({ ok: true, until });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to timeout user.' });
  }
};
