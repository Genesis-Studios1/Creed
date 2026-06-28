const OWNER_DISCORD_ID = '1308499431666094124';
const OWNER_USERNAME = 'animefan123764';

function isOwner(user) {
  if (!user) return false;
  const idMatch = String(user.id || '') === OWNER_DISCORD_ID;
  const nameMatch = String(user.username || '').toLowerCase() === OWNER_USERNAME.toLowerCase();
  if (idMatch) return !user.username || nameMatch;
  return nameMatch;
}
