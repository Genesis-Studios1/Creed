# Creed Bot Website — Setup Guide

## Project Structure

```
Creed Bot Website/
├── index.html              ← Landing page (hero, features, commands, AI chat)
├── css/
│   ├── style.css           ← Global tokens, buttons, modals, utilities
│   ├── landing.css         ← Landing page specific styles
│   └── dashboard.css       ← Admin panel & dashboard styles
├── js/
│   ├── main.js             ← Nav, counters, login modal, toast
│   ├── canvas-bg.js        ← Animated particle network background
│   ├── captcha.js          ← SVG CAPTCHA (renders in-browser, no service needed)
│   ├── commands.js         ← Commands tab data & rendering
│   ├── ai-chat.js          ← Claude AI chatbot (calls Anthropic API)
│   └── admin.js            ← Admin panel logic (owner check, live data, managers)
├── pages/
│   ├── dashboard.html      ← User dashboard (server management)
│   ├── admin.html          ← Admin panel (OWNER ONLY: ID 1308499431666094124)
│   └── auth-callback.html  ← Discord OAuth2 callback handler
└── SETUP.md                ← This file
```

---

## Step 1 — Discord Application Setup

1. Go to https://discord.com/developers/applications
2. Click **New Application** → Name it "Creed"
3. Go to **OAuth2** → copy your **Client ID** and **Client Secret**
4. Under **Redirects**, add:
   ```
   https://yourdomain.com/pages/auth-callback.html
   http://localhost/pages/auth-callback.html  (for local dev)
   ```
5. Go to **Bot** → click **Add Bot** → copy the **Bot Token**
6. Enable **Privileged Gateway Intents**:
   - Server Members Intent ✅
   - Message Content Intent ✅

---

## Step 2 — Configure the Website

### In `js/main.js`, update:
```javascript
const CLIENT_ID    = 'YOUR_DISCORD_CLIENT_ID';   // from Step 1
const REDIRECT_URI = 'https://yourdomain.com/pages/auth-callback.html';
```

Then uncomment this line to enable real OAuth redirect:
```javascript
window.location.href = url;
```

### In `pages/auth-callback.html`, replace the demo block:
```javascript
// Replace the demo simulation with a real fetch to your backend:
const res  = await fetch('/api/auth/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code })
});
const user = await res.json(); // { id, username, discriminator, avatar }
```

---

## Step 3 — Backend (Node.js / Express example)

Create a simple Express server to handle the OAuth token exchange:

```javascript
// server.js
const express  = require('express');
const fetch    = require('node-fetch');
const app      = express();
app.use(express.json());
app.use(express.static('.'));

const CLIENT_ID     = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI  = 'https://yourdomain.com/pages/auth-callback.html';

app.post('/api/auth/callback', async (req, res) => {
  const { code } = req.body;

  // Exchange code for token
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI
    })
  });
  const tokens = await tokenRes.json();

  // Get user info
  const userRes  = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  const user = await userRes.json();

  res.json({ id: user.id, username: user.username, discriminator: user.discriminator, avatar: user.avatar });
});

app.listen(3000, () => console.log('Server on port 3000'));
```

Install dependencies:
```bash
npm install express node-fetch
node server.js
```

---

## Step 4 — AI Chat Setup

The AI chatbot in `js/ai-chat.js` calls the Anthropic API directly.

**For production**, route through your backend to protect your API key:
```javascript
// In ai-chat.js, change the fetch to:
const res = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: chatHistory })
});
```

Add to your Express server:
```javascript
const Anthropic = require('@anthropic-ai/sdk');
const client    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/ai/chat', async (req, res) => {
  const { messages } = req.body;
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6', max_tokens: 1000,
    system: 'You are Creed, a Discord bot assistant...',
    messages
  });
  res.json({ reply: response.content[0].text });
});
```

---

## Admin Panel Access

The admin panel (`pages/admin.html`) automatically checks the logged-in user's Discord ID.

**Only Discord ID `1308499431666094124` sees the admin panel.**

All other users see an "Access Denied" screen.

Admin features:
- 📊 Live overview stats (online users, servers, logins, managers)
- 👥 Online users list with kick action
- 🔔 Notifications feed (login events, mod actions) with badge count
- 🛡️ Manager management (add/remove by Discord ID + role)
- 🌐 Connected servers grid
- ⚙️ Bot settings + Discord OAuth configuration

---

## Hosting Options

| Option | Notes |
|--------|-------|
| **Vercel** | Deploy frontend instantly, add serverless functions for backend |
| **Railway** | Full Node.js hosting with environment variables |
| **Netlify** | Static frontend + Netlify Functions for OAuth |
| **VPS (Ubuntu)** | Full control; run Express with PM2 |

---

## Environment Variables

```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/pages/auth-callback.html
DISCORD_BOT_TOKEN=your_bot_token
ANTHROPIC_API_KEY=your_anthropic_key
```
