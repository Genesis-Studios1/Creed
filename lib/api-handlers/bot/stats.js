const { setBotReportedMessages } = require('../_messageStore');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.BOT_STATS_SECRET;
  if (secret && req.headers['x-bot-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { messagesSent } = req.body || {};
  if (messagesSent === undefined || messagesSent === null) {
    return res.status(400).json({ error: 'Missing messagesSent' });
  }

  const total = setBotReportedMessages(messagesSent);
  return res.status(200).json({ ok: true, messagesSent: total });
};
