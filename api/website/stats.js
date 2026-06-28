const active = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, value] of active.entries()) {
    if (now - value.lastSeen > 120000) active.delete(key);
  }
}

setInterval(cleanup, 30000);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  cleanup();
  return res.status(200).json({ count: active.size, sessions: Array.from(active.values()) });
};
