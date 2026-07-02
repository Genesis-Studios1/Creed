const { getDiscordStats } = require('./_utils');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID || '1519033305473880149';

  if (!botToken) {
    return res.status(503).json({
      error: 'DISCORD_BOT_TOKEN is not configured in Vercel environment variables.',
      configured: false
    });
  }

  try {
    const stats = await getDiscordStats(botToken, guildId);
    return res.status(200).json({ ...stats, configured: true });
  } catch (error) {
    console.error('Discord stats error:', error.message);
    return res.status(502).json({
      error: error.message || 'Unable to load Discord stats.',
      configured: true
    });
  }
};
