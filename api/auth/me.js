const { parseSessionCookieValue } = require('./_session');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|; )creed_session=([^;]+)/);
  const sessionValue = match ? decodeURIComponent(match[1]) : null;

  const parsed = parseSessionCookieValue(sessionValue);
  if (!parsed?.user) {
    return res.status(401).json({ ok: false, authenticated: false });
  }

  return res.status(200).json({ ok: true, authenticated: true, user: parsed.user });
};
