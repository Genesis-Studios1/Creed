const crypto = require('crypto');
const { ADMIN_DISCORD_USER_ID, isWebsiteAdmin } = require('./_adminStore');

const ADMIN_PANEL_PASSWORD = process.env.ADMIN_PANEL_PASSWORD || '70345678619024076904';

function getAdminSecret() {
  return process.env.ADMIN_AUTH_SECRET
    || process.env.DISCORD_CLIENT_SECRET
    || process.env.DISCORD_BOT_TOKEN
    || '';
}

function createAdminToken(userId) {
  const secret = getAdminSecret();
  if (!secret || !isWebsiteAdmin(userId)) return null;
  return crypto
    .createHmac('sha256', secret)
    .update(String(userId))
    .digest('hex');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function isAuthorizedAdmin(req) {
  const suppliedPassword = req.headers['x-admin-password'];
  if (suppliedPassword && suppliedPassword === ADMIN_PANEL_PASSWORD) return true;

  const userId = req.headers['x-admin-user-id'];
  if (!isWebsiteAdmin(userId)) return false;

  const token = req.headers['x-admin-token'];
  const expectedToken = createAdminToken(userId);
  if (!expectedToken) return true;
  return Boolean(token && safeEqual(token, expectedToken));
}

function requireAdmin(req, res) {
  if (isAuthorizedAdmin(req)) return true;
  res.status(403).json({ error: 'Admin access is restricted.' });
  return false;
}

module.exports = {
  ADMIN_DISCORD_USER_ID,
  ADMIN_PANEL_PASSWORD,
  createAdminToken,
  isAuthorizedAdmin,
  requireAdmin
};
