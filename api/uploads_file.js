// Serves uploaded files (stored on the GitHub data branch under server/uploads/).
// Rewritten from /uploads/<name> in vercel.json.

const GH_TOKEN = process.env.GH_TOKEN || '';
const OWNER = process.env.GH_OWNER || 'Ashraf1902';
const REPO = 'real-estate';
const BRANCH = 'data';

export default async function handler(req, res) {
  const name = (req.query && (req.query.n || '')) || (req.url || '').split('?')[0].split('/').pop() || '';
  const safe = String(name).replace(/[^a-zA-Z0-9._-]/g, '').replace(/\.\./g, '');
  if (!safe) { res.status(400).end('bad name'); return; }

  const path = `server/uploads/${safe}`;
  const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json' },
  }).catch(() => null);

  const ext = safe.split('.').pop().toLowerCase();
  const type = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';

  if (!r || !r.ok) {
    res.status(404).setHeader('Content-Type', 'text/plain').end('not found');
    return;
  }
  const body = await r.json().catch(() => null);
  if (!body || !body.content) { res.status(404).end('not found'); return; }
  const buf = Buffer.from(body.content.replace(/\n/g, ''), 'base64');
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  res.status(200).end(buf);
}
