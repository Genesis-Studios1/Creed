const { createSessionCookieValue } = require('./_session');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const password = req.body?.password;
  const dashboardPassword = process.env.CREED_ADMIN_PASSWORD || 'Creed2026!';

  if (!password || password !== dashboardPassword) {
    return res.status(401).json({ ok: false, error: 'Incorrect password.' });
  }

  const user = {
    id: 'dashboard-owner',
    username: 'Owner',
    discriminator: '0001',
    avatar: null,
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
    role: 'owner',
    serverRole: 'Owner',
    lastLoginAt: new Date().toISOString(),
    loggedInAt: new Date().toISOString()
  };

  const sessionValue = createSessionCookieValue(user);
  res.setHeader('Set-Cookie', [`creed_session=${sessionValue}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' ? '; Secure' : ''}`]);
  return res.status(200).json({ ok: true, user, sessionId: sessionValue });
};
