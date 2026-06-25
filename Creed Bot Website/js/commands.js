/* ═══════════════════════════════════════════
   COMMANDS.JS
   ═══════════════════════════════════════════ */

const CMD_DATA = {
  mod: [
    { name: '/ban',       desc: 'Permanently ban a user from the server',    badge: 'Admin' },
    { name: '/kick',      desc: 'Kick a member from the server',              badge: 'Mod' },
    { name: '/mute',      desc: 'Timeout a user for a specified duration',    badge: 'Mod' },
    { name: '/warn',      desc: 'Issue a formal warning to a member',         badge: 'Mod' },
    { name: '/purge',     desc: 'Bulk-delete messages in a channel',          badge: 'Admin' },
    { name: '/slowmode',  desc: 'Set channel slowmode in seconds',            badge: 'Mod' },
    { name: '/lock',      desc: 'Lock a channel from member messages',        badge: 'Admin' },
    { name: '/unban',     desc: 'Remove a ban from a user',                   badge: 'Admin' },
  ],
  music: [
    { name: '/play',      desc: 'Play a song or playlist (YouTube/Spotify)',  badge: 'Member' },
    { name: '/skip',      desc: 'Skip to the next song in the queue',         badge: 'Member' },
    { name: '/queue',     desc: 'Display the current song queue',             badge: 'Member' },
    { name: '/pause',     desc: 'Pause the current track',                    badge: 'Member' },
    { name: '/volume',    desc: 'Set playback volume (0–100)',                 badge: 'DJ' },
    { name: '/filter',    desc: 'Apply audio effects (bass, nightcore…)',     badge: 'DJ' },
    { name: '/lyrics',    desc: 'Fetch lyrics for the current track',         badge: 'Member' },
    { name: '/nowplaying',desc: 'Show what\'s currently playing',             badge: 'Member' },
  ],
  fun: [
    { name: '/meme',      desc: 'Send a random meme from Reddit',             badge: 'Member' },
    { name: '/trivia',    desc: 'Start a trivia challenge',                   badge: 'Member' },
    { name: '/8ball',     desc: 'Ask the magic 8-ball a question',            badge: 'Member' },
    { name: '/battle',    desc: 'RPG-style duel with another member',         badge: 'Member' },
    { name: '/daily',     desc: 'Claim your daily coin reward',               badge: 'Member' },
    { name: '/shop',      desc: 'Browse the economy shop',                   badge: 'Member' },
    { name: '/balance',   desc: 'Check your coin balance',                   badge: 'Member' },
    { name: '/leaderboard',desc:'View the server leaderboard',               badge: 'Member' },
  ],
  util: [
    { name: '/serverinfo',desc: 'Display server statistics and details',      badge: 'Member' },
    { name: '/userinfo',  desc: 'View detailed info on a user',               badge: 'Member' },
    { name: '/poll',      desc: 'Create a reaction poll',                     badge: 'Member' },
    { name: '/remind',    desc: 'Set a personal reminder',                   badge: 'Member' },
    { name: '/translate', desc: 'Translate text to any language',             badge: 'Member' },
    { name: '/avatar',    desc: "Fetch a user's profile picture",             badge: 'Member' },
    { name: '/ping',      desc: 'Check bot latency and API status',           badge: 'Member' },
    { name: '/stats',     desc: 'View bot performance stats',                badge: 'Admin' },
  ],
  ai: [
    { name: '/ask',       desc: 'Ask the AI a question',                      badge: 'Member' },
    { name: '/imagine',   desc: 'Generate an image with AI',                  badge: 'Member' },
    { name: '/summarize', desc: 'Summarize a piece of text',                  badge: 'Member' },
    { name: '/chat',      desc: 'Start a multi-turn AI conversation',         badge: 'Member' },
    { name: '/roast',     desc: 'Get an AI roast of a server member',         badge: 'Member' },
    { name: '/story',     desc: 'Generate a creative short story',            badge: 'Member' },
    { name: '/code',      desc: 'Get code help from the AI',                  badge: 'Member' },
    { name: '/debate',    desc: 'AI debates any topic with you',              badge: 'Member' },
  ]
};

const BADGE_CLASS = {
  Admin: 'badge-red', Mod: 'badge-amber', DJ: 'badge-blue', Member: 'badge-green'
};

let currentCmd = 'mod';

function switchCmd(tab, el) {
  currentCmd = tab;
  document.querySelectorAll('.cmd-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderCmds(tab);
}

function renderCmds(tab) {
  const grid = document.getElementById('cmdGrid');
  if (!grid) return;
  grid.innerHTML = CMD_DATA[tab].map(c => `
    <div class="cmd-item">
      <div>
        <div class="cmd-name">${c.name}</div>
        <div class="cmd-desc">${c.desc}</div>
      </div>
      <span class="badge ${BADGE_CLASS[c.badge] || 'badge-green'}">${c.badge}</span>
    </div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => renderCmds('mod'));
