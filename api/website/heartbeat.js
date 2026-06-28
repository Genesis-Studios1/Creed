const { createHash } = require('crypto');

const active = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, value] of active.entries()) {
    if (now - value.lastSeen > 120000) active.delete(key);
  }
}

setInterval(cleanup, 30000);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, userId } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  cleanup();
  active.set(sessionId, { sessionId, userId: userId || null, lastSeen: Date.now() });
  return res.status(200).json({ ok: true, count: active.size });
};
