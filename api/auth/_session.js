const crypto = require('crypto');

function createSessionCookieValue(user, { secret = process.env.SESSION_SECRET || 'creed-dev-secret' } = {}) {
  const payload = JSON.stringify({ user, issuedAt: Date.now() });
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

function parseSessionCookieValue(value, { secret = process.env.SESSION_SECRET || 'creed-dev-secret' } = {}) {
  if (!value) return null;
  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const [payload, signature] = decoded.split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (expected !== signature) return null;
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

module.exports = {
  createSessionCookieValue,
  parseSessionCookieValue
};
