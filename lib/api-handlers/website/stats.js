const { getSessions } = require('../_websiteStore');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessions = getSessions();
  return res.status(200).json({ count: sessions.length, sessions });
};
