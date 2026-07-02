const url = require('url');

const routeMap = new Map();

function register(pathname, handler) {
  routeMap.set(pathname, handler);
}

// Auth
register('/api/auth/login', require('../lib/api-handlers/auth/login'));
register('/api/auth/record-login', require('../lib/api-handlers/auth/record-login'));
register('/api/auth/me', require('../lib/api-handlers/auth/me'));
register('/api/auth/logout', require('../lib/api-handlers/auth/logout'));
register('/api/auth/callback', require('../lib/api-handlers/auth/callback'));

// Website
register('/api/website/heartbeat', require('../lib/api-handlers/website/heartbeat'));
register('/api/website/stats', require('../lib/api-handlers/website/stats'));

// AI
register('/api/ai/chat', require('../lib/api-handlers/ai/chat'));

// Discord
register('/api/discord/stats', require('../lib/api-handlers/discord/stats'));
register('/api/discord/roles', require('../lib/api-handlers/discord/roles'));
register('/api/discord/set-role', require('../lib/api-handlers/discord/set-role'));
register('/api/discord/members', require('../lib/api-handlers/discord/members'));
register('/api/discord/ban', require('../lib/api-handlers/discord/ban'));
register('/api/discord/timeout', require('../lib/api-handlers/discord/timeout'));
register('/api/discord/sync-member-role', require('../lib/api-handlers/discord/sync-member-role'));

// Bot
register('/api/bot/stats', require('../lib/api-handlers/bot/stats'));

module.exports = async (req, res) => {
  const parsed = url.parse(req.url || req.originalUrl || '');
  const pathname = parsed.pathname || req.url;
  const normalized = pathname.replace(/\/$/, '');

  const handler = routeMap.get(pathname) || routeMap.get(normalized);
  if (!handler) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  try {
    await handler(req, res);
  } catch (err) {
    console.error('api/[[...slug]] error', err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
};
