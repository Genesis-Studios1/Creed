/** Creed Bot slash-command reference for the AI assistant */
module.exports = {
  prefix: '/',
  categories: {
    moderation: [
      { cmd: '/ban', desc: 'Permanently ban a user' },
      { cmd: '/kick', desc: 'Kick a member from the server' },
      { cmd: '/mute', desc: 'Timeout a user for a set duration' },
      { cmd: '/warn', desc: 'Issue a formal warning' },
      { cmd: '/purge', desc: 'Bulk-delete messages in a channel' },
      { cmd: '/slowmode', desc: 'Set channel slowmode (seconds)' },
      { cmd: '/lock', desc: 'Lock a channel from member messages' },
      { cmd: '/unban', desc: 'Remove a ban from a user' }
    ],
    music: [
      { cmd: '/play', desc: 'Play a song or playlist (YouTube/Spotify)' },
      { cmd: '/skip', desc: 'Skip to the next song' },
      { cmd: '/queue', desc: 'Show the current song queue' },
      { cmd: '/pause', desc: 'Pause playback' },
      { cmd: '/volume', desc: 'Set volume 0–100' },
      { cmd: '/filter', desc: 'Apply audio effects (bass, nightcore…)' },
      { cmd: '/lyrics', desc: 'Fetch lyrics for the current track' },
      { cmd: '/nowplaying', desc: 'Show what is currently playing' }
    ],
    fun: [
      { cmd: '/meme', desc: 'Random meme from Reddit' },
      { cmd: '/trivia', desc: 'Start a trivia challenge' },
      { cmd: '/8ball', desc: 'Ask the magic 8-ball' },
      { cmd: '/battle', desc: 'RPG-style duel with another member' },
      { cmd: '/daily', desc: 'Claim daily coin reward' },
      { cmd: '/shop', desc: 'Browse the economy shop' },
      { cmd: '/balance', desc: 'Check your coin balance' },
      { cmd: '/leaderboard', desc: 'View the server leaderboard' }
    ],
    utility: [
      { cmd: '/serverinfo', desc: 'Server statistics and details' },
      { cmd: '/userinfo', desc: 'Detailed info on a user' },
      { cmd: '/poll', desc: 'Create a reaction poll' },
      { cmd: '/remind', desc: 'Set a personal reminder' },
      { cmd: '/translate', desc: 'Translate text to another language' },
      { cmd: '/avatar', desc: "Get a user's profile picture" },
      { cmd: '/ping', desc: 'Check bot latency' },
      { cmd: '/stats', desc: 'Bot performance stats (admin)' }
    ],
    ai: [
      { cmd: '/ask', desc: 'Ask the AI a question' },
      { cmd: '/imagine', desc: 'Generate an image with AI' },
      { cmd: '/summarize', desc: 'Summarize text' },
      { cmd: '/chat', desc: 'Multi-turn AI conversation' },
      { cmd: '/code', desc: 'Get coding help from the AI' }
    ]
  }
};
