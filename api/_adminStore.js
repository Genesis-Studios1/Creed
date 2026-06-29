const fs = require('fs');
const path = require('path');

const ADMIN_DISCORD_USER_ID = process.env.ADMIN_DISCORD_USER_ID || '1308499431666094124';
const STORE_PATH = path.join(__dirname, 'admin-store.json');

function readStore() {
  try {
    const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    return { admins: Array.isArray(data.admins) ? data.admins : [] };
  } catch {
    return { admins: [] };
  }
}

function writeStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function normalizeAdmin(admin) {
  return {
    id: String(admin.id || '').trim(),
    name: String(admin.name || 'Website Admin').trim() || 'Website Admin',
    role: admin.role || 'admin',
    added: admin.added || new Date().toISOString().split('T')[0]
  };
}

function listAdmins() {
  const store = readStore();
  const owner = { id: ADMIN_DISCORD_USER_ID, name: 'Owner', role: 'owner', added: 'default' };
  const others = store.admins.filter(admin => admin.id && admin.id !== ADMIN_DISCORD_USER_ID);
  return [owner, ...others];
}

function isWebsiteAdmin(userId) {
  const id = String(userId || '');
  return Boolean(id && listAdmins().some(admin => admin.id === id));
}

function addAdmin(admin) {
  const next = normalizeAdmin(admin);
  if (!next.id) throw new Error('Missing admin user ID.');
  const store = readStore();
  const existing = store.admins.find(item => item.id === next.id);
  if (existing) Object.assign(existing, next);
  else store.admins.push(next);
  writeStore(store);
  return next;
}

function removeAdmin(userId) {
  const id = String(userId || '');
  if (!id || id === ADMIN_DISCORD_USER_ID) return false;
  const store = readStore();
  const before = store.admins.length;
  store.admins = store.admins.filter(admin => admin.id !== id);
  writeStore(store);
  return store.admins.length !== before;
}

module.exports = {
  ADMIN_DISCORD_USER_ID,
  listAdmins,
  isWebsiteAdmin,
  addAdmin,
  removeAdmin
};
