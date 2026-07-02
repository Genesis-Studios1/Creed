const OWNER_DISCORD_ID = '1308499431666094124';
const OWNER_USERNAME = 'animefan123764';
const ADMIN_STORAGE_KEY = 'creed_admins';

function isOwner(user) {
  if (!user) return false;
  const idMatch = String(user.id || '') === OWNER_DISCORD_ID;
  const nameMatch = String(user.username || '').toLowerCase() === OWNER_USERNAME.toLowerCase();
  return idMatch || nameMatch;
}

function getStoredAdmins() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveStoredAdmins(admins) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
}

function isAdmin(user) {
  if (!user) return false;
  if (isOwner(user)) return true;
  const admins = getStoredAdmins();
  const userId = String(user.id || '');
  const username = String(user.username || '').toLowerCase();
  return admins.some((entry) => {
    const idMatch = String(entry.id || '') && String(entry.id || '') === userId;
    const nameMatch = String(entry.name || '').toLowerCase() && String(entry.name || '').toLowerCase() === username;
    return idMatch || nameMatch;
  });
}
