const { createSessionCookieValue } = require('./_session');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = req.body || {};
  if (!user || !user.id) {
    return res.status(400).json({ ok: false, error: 'Missing user details.' });
  }

  const sessionValue = createSessionCookieValue({ ...user, lastLoginAt: user.lastLoginAt || new Date().toISOString() });
  res.setHeader('Set-Cookie', [`creed_session=${sessionValue}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' ? '; Secure' : ''}`]);
  return res.status(200).json({ ok: true, user, sessionId: sessionValue });
};
