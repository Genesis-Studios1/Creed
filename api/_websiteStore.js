const active = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, value] of active.entries()) {
    if (now - value.lastSeen > 120000) active.delete(key);
  }
}

function trackSession(sessionId, userId) {
  cleanup();
  active.set(sessionId, {
    sessionId,
    userId: userId || null,
    lastSeen: Date.now()
  });
  return active.size;
}

function getSessions() {
  cleanup();
  return Array.from(active.values());
}

module.exports = { trackSession, getSessions, cleanup };
