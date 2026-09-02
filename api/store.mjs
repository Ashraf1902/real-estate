// Shared persistence for the Vercel serverless API using GitHub as free storage.
// The whole app state is a single JSON document (server/data.json) stored on a
// dedicated "data" branch via the GitHub Git Data API. Writes are serialized and
// retried on branch conflicts. Uploaded images are committed as files on the
// same branch under server/uploads/.

const GH_TOKEN = process.env.GH_TOKEN || '';
const OWNER = process.env.GH_OWNER || 'Ashraf1902';
const REPO = 'real-estate';
const BRANCH = 'data';
const FILEPATH = 'server/data.json';

const CACHE_TTL = 45 * 1000;
let cachedDb = null;
let cachedAt = 0;
let writeLock = Promise.resolve();

function gh(path, opts = {}) {
  if (!GH_TOKEN) throw new Error('GH_TOKEN not configured');
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.headers || {}),
    },
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, body: j };
  });
}

async function branchHead() {
  const r = await gh(`/git/ref/heads/${BRANCH}`);
  if (!r.ok) return null;
  return r.body.object.sha;
}

async function ensureBranch() {
  const head = await branchHead();
  if (head) return head;
  const master = await gh(`/git/ref/heads/master`);
  if (!master.ok) throw new Error('master branch not found');
  await gh(`/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: master.body.object.sha }),
  });
  return master.body.object.sha;
}

async function fetchData() {
  const r = await gh(`/contents/${FILEPATH}?ref=${BRANCH}`);
  if (!r.ok) return null;
  if (typeof r.body.content === 'string') {
    return Buffer.from(r.body.content.replace(/\n/g, ''), 'base64').toString('utf8');
  }
  if (r.body.download_url) {
    return fetch(r.body.download_url).then((x) => x.text());
  }
  return null;
}

// Create a commit on the data branch adding/modifying the given files.
// files: [{ path, content (string, utf8) }]. Retries on branch-ref conflicts
// (concurrent writes) by re-reading the latest head and rebasing the commit.
async function commitFiles(files, { attempts = 5 } = {}) {
  for (let i = 0; i <= attempts; i++) {
    const head = await ensureBranch();
    const meta = await gh(`/git/commits/${head}`);
    if (!meta.ok) throw new Error('cannot read branch head commit');
    const baseTree = meta.body.tree.sha;

    const treeEntries = [];
    for (const f of files) {
      const blob = await gh(`/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({
          content: f.base64 !== undefined ? f.base64 : f.content,
          encoding: f.base64 !== undefined ? 'base64' : 'utf-8',
        }),
      });
      if (!blob.ok) throw new Error('cannot create blob for ' + f.path);
      treeEntries.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.body.sha });
    }

    const tree = await gh(`/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseTree, tree: treeEntries }),
    });
    if (!tree.ok) throw new Error('cannot create tree');

    const commit = await gh(`/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: `data update ${new Date().toISOString()}`,
        tree: tree.body.sha,
        parents: [head],
      }),
    });
    if (!commit.ok) throw new Error('cannot create commit');

    const upd = await gh(`/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.body.sha, force: true }),
    });
    if (upd.ok) return;
    // Non-fast-forward / conflict -> loop retries with a fresh head
  }
  throw new Error('timed out applying commit after concurrent conflicts');
}

async function loadDb(seed) {
  if (cachedDb && Date.now() - cachedAt < CACHE_TTL) return cachedDb;
  const text = await fetchData();
  let db = null;
  if (text) {
    try { db = JSON.parse(text); } catch { db = null; }
  }
  if (!db || !db.properties) db = JSON.parse(JSON.stringify(seed));
  db = normalize(db, seed);
  cachedDb = db;
  cachedAt = Date.now();
  if (!text) {
    writeLock = writeLock.then(() => commitFiles([{ path: FILEPATH, content: JSON.stringify(db) }]).catch(() => {}));
  }
  return db;
}

async function saveDb(db) {
  cachedDb = db;
  cachedAt = Date.now();
  const content = JSON.stringify(db);
  writeLock = writeLock.then(() => commitFiles([{ path: FILEPATH, content }]));
  return writeLock;
}

// Persist an uploaded binary file (e.g. WebP) to the data branch. Returns its
// URL path (served by the static uploads rewrite) — see vercel.json.
async function saveUpload(filename, buffer) {
  return commitFiles([{ path: `server/uploads/${filename}`, base64: buffer.toString('base64') }]);
}

export { loadDb, saveDb, saveUpload };

export function normalize(db, seed) {
  db.properties = db.properties ?? JSON.parse(JSON.stringify(seed.properties));
  db.services = db.services ?? JSON.parse(JSON.stringify(seed.services));
  db.bookings = db.bookings ?? [];
  db.leads = db.leads ?? [];
  db.settings = Object.assign({}, JSON.parse(JSON.stringify(seed.settings)), db.settings || {});
  db.seq = db.seq ?? { booking: 0, lead: 0 };
  return db;
}
