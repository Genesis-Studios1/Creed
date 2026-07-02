module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', ['creed_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax']);
  return res.status(200).json({ ok: true });
};
