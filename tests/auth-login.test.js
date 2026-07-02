const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
let server;

async function waitForServer(url, timeoutMs = 8000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become ready at ${url}`);
}

test.before(async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: repoRoot,
    env: { ...process.env, PORT: '3101', CREED_ADMIN_PASSWORD: 'testpass' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', data => {
    process.stdout.write(`[server] ${data}`);
  });
  server.stderr.on('data', data => {
    process.stderr.write(`[server] ${data}`);
  });

  await waitForServer('http://127.0.0.1:3101/');
});

test.after(() => {
  if (server && !server.killed) {
    server.kill('SIGTERM');
  }
});

test('accepts the configured dashboard password', async () => {
  const res = await fetch('http://127.0.0.1:3101/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'testpass' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.user.role, 'owner');
});

test('rejects an incorrect dashboard password', async () => {
  const res = await fetch('http://127.0.0.1:3101/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrongpass' })
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.ok, false);
});

test('records the authenticated user in website stats for the admin panel', async () => {
  const res = await fetch('http://127.0.0.1:3101/api/website/stats');
  assert.equal(res.status, 200);
  const data = await res.json();
  const user = (data.users || []).find(entry => entry.id === 'dashboard-owner');
  assert.ok(user);
  assert.equal(user.username, 'Owner');
});
