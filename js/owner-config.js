const OWNER_DISCORD_ID = '1308499431666094124';

function isOwner(user) {
  if (!user) return false;
  return String(user.id || '') === OWNER_DISCORD_ID;
}
