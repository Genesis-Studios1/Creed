/* ═══════════════════════════════════════════
   ADMIN.JS — Owner-only panel logic
   ═══════════════════════════════════════════ */

const OWNER_ID = '1308499431666094124';

// ── Auth check ──
function checkAccess() {
  const raw  = localStorage.getItem('creed_user');
  const user = raw ? JSON.parse(raw) : null;

  if (!user || user.id !== OWNER_ID) {
    document.getElementById('accessDenied').style.display = 'flex';
    document.getElementById('adminPanel').style.display   = 'none';
    return false;
  }

  document.getElementById('accessDenied').style.display = 'none';
  document.getElementById('adminPanel').style.display   = 'flex';
  document.getElementById('ownerTag').textContent       = `@${user.username || 'Owner'}`;
  return true;
}

// ── Mock data store (replace with real API calls) ──
let mockUsers = [
  { id: '1308499431666094124', name: 'Owner',      role: 'owner',    since: '2m ago',  avatar: '👑' },
  { id: '849302847261',        name: 'Darkstrike',  role: 'member',   since: '5m ago',  avatar: '⚡' },
  { id: '773920182736',        name: 'Novalynx',   role: 'manager',  since: '8m ago',  avatar: '🛡️' },
  { id: '660294710385',        name: 'Celestix',   role: 'member',   since: '11m ago', avatar: '🌙' },
  { id: '591837462910',        name: 'Wraithbane', role: 'moderator',since: '14m ago', avatar: '🔥' },
];

let mockManagers = [
  { id: '773920182736', name: 'Novalynx',   role: 'manager',   added: '2025-07-01' },
  { id: '591837462910', name: 'Wraithbane', role: 'moderator', added: '2025-07-03' },
];

let mockNotifs = [
  { icon: '🟢', text: '<strong>Darkstrike</strong> logged in via Discord', time: '2 min ago',  unread: true },
  { icon: '🟢', text: '<strong>Celestix</strong> logged in via Discord',   time: '6 min ago',  unread: true },
  { icon: '🛡️', text: '<strong>Novalynx</strong> was added as Manager',    time: '1 hr ago',   unread: false },
  { icon: '🔴', text: '<strong>Phantom_99</strong> failed captcha 3x',    time: '2 hr ago',   unread: false },
  { icon: '⚠️', text: 'Bot restarted — all systems online',              time: '5 hr ago',   unread: false },
];

let mockServers = [
  { icon: '🏰', name: 'The Sanctum',   members: 3412 },
  { icon: '⚡', name: 'Stormkeep',     members: 1870 },
  { icon: '🌙', name: 'Lunar Veil',    members: 924  },
  { icon: '🔥', name: 'Emberhaven',    members: 2203 },
  { icon: '🛡️', name: 'Iron Citadel',  members: 5621 },
  { icon: '🌊', name: 'Tidewatch',     members: 788  },
];

// ── Tab switching ──
function switchTab(tab, el) {
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');

  const titles = {
    overview: ['Overview', 'Real-time bot statistics'],
    users:    ['Online Users', 'Members currently logged in'],
    notifs:   ['Notifications', 'Login events and alerts'],
    managers: ['Managers', 'Manage website roles'],
    servers:  ['Servers', 'Discord servers using Creed'],
    settings: ['Settings', 'Bot and OAuth configuration'],
  };
  document.getElementById('pageTitle').textContent = titles[tab][0];
  document.getElementById('pageSub').textContent   = titles[tab][1];

  if (tab === 'notifs') clearBadge();
  if (tab === 'servers') renderServers();
}

// ── Overview ──
function renderOverview() {
  document.getElementById('sc-online').textContent   = mockUsers.length;
  document.getElementById('sc-servers').textContent  = mockServers.length;
  document.getElementById('sc-logins').textContent   = 47;
  document.getElementById('sc-managers').textContent = mockManagers.length;

  // Recent logins list
  const list = document.getElementById('recentLogins');
  if (list) {
    list.innerHTML = mockUsers.map(u => `
      <div class="activity-item">
        <div class="act-avatar">${u.avatar}</div>
        <div>
          <div class="act-name">${u.name}</div>
          <div style="font-size:11px;color:var(--text-3)">${u.id}</div>
        </div>
        <span class="badge ${u.role === 'owner' ? 'badge-amber' : u.role === 'manager' ? 'badge-blue' : 'badge-green'}">${u.role}</span>
        <span class="act-time">${u.since}</span>
      </div>`).join('');
  }

  drawChart();
}

// ── Chart ──
function drawChart() {
  const canvas = document.getElementById('activityChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400, H = 180;
  canvas.width = W; canvas.height = H;

  const data = [2,5,3,8,12,6,9,14,7,11,16,9,13,20,15,8,12,18,10,14,22,17,9,12];
  const max  = Math.max(...data);
  const pad  = { t:10, r:10, b:30, l:30 };
  const gw   = W - pad.l - pad.r, gh = H - pad.t - pad.b;

  ctx.clearRect(0,0,W,H);

  // Grid
  ctx.strokeStyle = 'rgba(0,255,136,0.07)';
  ctx.lineWidth   = 0.8;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (gh / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
  }

  // Fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
  grad.addColorStop(0, 'rgba(0,255,136,0.25)');
  grad.addColorStop(1, 'rgba(0,255,136,0)');

  ctx.beginPath();
  data.forEach((v,i) => {
    const x = pad.l + (gw / (data.length - 1)) * i;
    const y = pad.t + gh - (v / max) * gh;
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  const lastX = pad.l + gw, firstX = pad.l;
  ctx.lineTo(lastX, H - pad.b); ctx.lineTo(firstX, H - pad.b); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  data.forEach((v,i) => {
    const x = pad.l + (gw / (data.length - 1)) * i;
    const y = pad.t + gh - (v / max) * gh;
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  ctx.stroke();

  // Dots
  data.forEach((v,i) => {
    const x = pad.l + (gw / (data.length - 1)) * i;
    const y = pad.t + gh - (v / max) * gh;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI*2);
    ctx.fillStyle = '#00ff88'; ctx.fill();
  });
}

// ── Online Users ──
function renderUsers() {
  const tbody = document.getElementById('usersTableBody');
  const count = document.getElementById('onlineCount');
  if (!tbody) return;
  if (count) count.textContent = mockUsers.length;

  tbody.innerHTML = mockUsers.map(u => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;background:rgba(0,255,136,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;">${u.avatar}</div>
        <strong>${u.name}</strong>
      </div></td>
      <td style="font-family:monospace;font-size:12px;color:var(--text-3)">${u.id}</td>
      <td><span class="badge ${u.role==='owner'?'badge-amber':u.role==='manager'||u.role==='moderator'?'badge-blue':'badge-green'}">${u.role}</span></td>
      <td style="color:var(--text-3);font-size:12px">${u.since}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="kickUser('${u.id}')">Kick</button></td>
    </tr>`).join('');
}

function filterUsers() {
  const q = document.getElementById('userSearch')?.value?.toLowerCase() || '';
  document.querySelectorAll('#usersTableBody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function kickUser(id) {
  if (id === OWNER_ID) { showToast('Cannot kick the owner.', 'error'); return; }
  mockUsers = mockUsers.filter(u => u.id !== id);
  renderUsers();
  addNotif('🔴', `User <strong>${id}</strong> was kicked from the session`, 'just now');
  showToast('User kicked from session.', 'success');
}

// ── Notifications ──
function renderNotifs() {
  const list = document.getElementById('notifList');
  if (!list) return;
  if (mockNotifs.length === 0) {
    list.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-3)">No notifications</div>';
    return;
  }
  list.innerHTML = mockNotifs.map((n,i) => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" id="notif-${i}">
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-text">${n.text}</div>
      <div class="notif-time">${n.time}</div>
    </div>`).join('');
}

function clearNotifs() {
  mockNotifs = mockNotifs.map(n => ({ ...n, unread: false }));
  renderNotifs();
  clearBadge();
}

function clearBadge() {
  mockNotifs.forEach(n => n.unread = false);
  const badge = document.getElementById('notifBadge');
  if (badge) badge.textContent = '0';
}

function updateBadge() {
  const count = mockNotifs.filter(n => n.unread).length;
  const badge = document.getElementById('notifBadge');
  if (badge) badge.textContent = count;
}

function addNotif(icon, text, time) {
  mockNotifs.unshift({ icon, text, time, unread: true });
  updateBadge();
  renderNotifs();
}

// ── Managers ──
function renderManagers() {
  const tbody = document.getElementById('managersTableBody');
  if (!tbody) return;
  tbody.innerHTML = mockManagers.map(m => `
    <tr>
      <td><strong>${m.name}</strong></td>
      <td style="font-family:monospace;font-size:12px;color:var(--text-3)">${m.id}</td>
      <td><span class="badge badge-blue">${m.role}</span></td>
      <td style="font-size:12px;color:var(--text-3)">${m.added}</td>
      <td><button class="btn btn-danger btn-sm" onclick="removeManager('${m.id}')">Remove</button></td>
    </tr>`).join('');
}

function addManager() {
  const id   = document.getElementById('mgr-id')?.value?.trim();
  const name = document.getElementById('mgr-name')?.value?.trim();
  const role = document.getElementById('mgr-role')?.value;

  if (!id || !name) { showToast('Please fill in all fields.', 'error'); return; }
  if (mockManagers.find(m => m.id === id)) { showToast('This user is already a manager.', 'error'); return; }

  const added = new Date().toISOString().split('T')[0];
  mockManagers.push({ id, name, role, added });
  document.getElementById('mgr-id').value   = '';
  document.getElementById('mgr-name').value = '';
  renderManagers();
  addNotif('🛡️', `<strong>${name}</strong> was added as ${role}`, 'just now');
  showToast(`${name} added as ${role}!`);
  document.getElementById('sc-managers').textContent = mockManagers.length;
}

function removeManager(id) {
  const mgr = mockManagers.find(m => m.id === id);
  mockManagers = mockManagers.filter(m => m.id !== id);
  renderManagers();
  if (mgr) addNotif('❌', `<strong>${mgr.name}</strong> was removed from managers`, 'just now');
  showToast('Manager removed.');
  document.getElementById('sc-managers').textContent = mockManagers.length;
}

// ── Servers ──
function renderServers() {
  const grid = document.getElementById('serverGrid');
  if (!grid) return;
  grid.innerHTML = mockServers.map(s => `
    <div class="server-card">
      <div class="server-icon">${s.icon}</div>
      <div class="server-name">${s.name}</div>
      <div class="server-members">${s.members.toLocaleString()} members</div>
    </div>`).join('');
}

// ── Settings ──
function saveSettings() {
  showToast('Settings saved successfully!');
}

function saveOAuth() {
  const clientId = document.getElementById('clientId')?.value?.trim();
  const status   = document.getElementById('oauthStatus');
  if (!clientId) {
    if (status) { status.className = 'oauth-status error'; status.textContent = '❌ Please enter your Discord Client ID.'; }
    return;
  }
  // Save to localStorage for demo
  localStorage.setItem('creed_oauth', JSON.stringify({
    clientId: document.getElementById('clientId')?.value,
    redirectUri: document.getElementById('redirectUri')?.value,
  }));
  if (status) { status.className = 'oauth-status success'; status.textContent = '✅ OAuth settings saved. Connection test passed.'; }
  showToast('OAuth settings saved!');
}

function refreshAll() {
  renderOverview();
  renderUsers();
  renderNotifs();
  renderManagers();
  showToast('Data refreshed.');
}

// ── Toast ──
function showToast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Simulate live activity ──
function simulateLive() {
  const names  = ['Shadowvex', 'Kryonite', 'Veltrix', 'Lumenara', 'Fyreborn'];
  const random = names[Math.floor(Math.random() * names.length)];
  addNotif('🟢', `<strong>${random}</strong> logged in via Discord`, 'just now');
  mockUsers.push({ id: String(Date.now()), name: random, role: 'member', since: 'just now', avatar: '👤' });
  renderUsers();
  document.getElementById('sc-online').textContent = mockUsers.length;
  document.getElementById('sc-logins').textContent = parseInt(document.getElementById('sc-logins').textContent) + 1;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAccess()) return;
  renderOverview();
  renderUsers();
  renderNotifs();
  renderManagers();
  updateBadge();

  // Live simulation every 30 seconds
  setInterval(simulateLive, 30000);
  // Refresh chart on resize
  window.addEventListener('resize', drawChart);
});
