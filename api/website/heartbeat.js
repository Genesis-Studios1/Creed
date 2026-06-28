const { trackSession } = require('../_websiteStore');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, userId } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  const count = trackSession(sessionId, userId);
  return res.status(200).json({ ok: true, count });
};
