import { spawn } from 'node:child_process';

const backend = spawn('node', ['server/index.mjs'], { stdio: 'inherit', env: process.env });
const vite = spawn('node', ['node_modules/vite/bin/vite.js'], { stdio: 'inherit', env: process.env });

function shutdown(code) {
  try { backend.kill(); } catch {}
  try { vite.kill(); } catch {}
  process.exit(code ?? 0);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
backend.on('exit', () => shutdown(1));
vite.on('exit', () => shutdown(1));
