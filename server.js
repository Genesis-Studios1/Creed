require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1519043591916490948';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';

app.use(express.static(path.join(__dirname)));

app.get('/auth/discord/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'auth-callback.html'));
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth code.' });
  }

  if (!CLIENT_SECRET) {
    return res.status(500).json({ error: 'DISCORD_CLIENT_SECRET is not configured.' });
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: tokenData });
    }

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userRes.json();
    if (!userRes.ok) {
      return res.status(userRes.status).json({ error: userData });
    }

    res.json({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unknown error during OAuth exchange.' });
  }
});

app.listen(PORT, () => {
  console.log(`Creed Bot Website local server running at http://localhost:${PORT}`);
  console.log(`Discord redirect URI: ${REDIRECT_URI}`);
});
