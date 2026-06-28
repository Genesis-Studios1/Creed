const { generateCreedReply } = require('../../ai/chatService');
const { incrementWebsiteMessage } = require('../_messageStore');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages = [] } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing messages array.' });
    }

    incrementWebsiteMessage();
    const reply = await generateCreedReply({ messages });
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to generate AI response.' });
  }
};
