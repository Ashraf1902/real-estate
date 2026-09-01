// Shared persistence for the Vercel serverless API using GitHub as free storage.
// The whole app state is a single JSON document (server/data.json) stored on a
// dedicated "data" branch via the GitHub Git Data API. Writing via git commits
// avoids triggering Vercel builds on the deployment branch.

const GH_TOKEN = process.env.GH_TOKEN || '';
const OWNER = process.env.GH_OWNER || 'Ashraf1902';
const REPO = 'real-estate';
const BRANCH = 'data';
const FILEPATH = 'server/data.json';

const CACHE_TTL = 45 * 1000;
let cachedDb = null;
let cachedAt = 0;
// in-flight write guard to avoid concurrent commits from parallel invocations
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
    if (!r.ok) {
      // 404 with {message} object -> treat as not-found, allow caller to decide
      return { ok: r.ok, status: r.status, body: j };
    }
    return { ok: true, status: r.status, body: j };
  });
}

// Get the commit sha at the tip of the data branch.
async function branchHead() {
  const r = await gh(`/git/ref/heads/${BRANCH}`);
  if (!r.ok) return null;
  return r.body.object.sha;
}

async function ensureBranch() {
  const head = await branchHead();
  if (head) return head;
  // branch doesn't exist yet -> create it from master
  const master = await gh(`/git/ref/heads/master`);
  if (!master.ok) throw new Error('master branch not found');
  await gh(`/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: master.body.object.sha }),
  });
  return master.body.object.sha;
}

// Fetch and decode server/data.json from the data branch. Returns null if absent.
async function fetchData() {
  const r = await gh(`/contents/${FILEPATH}?ref=${BRANCH}`);
  if (!r.ok) return null;
  if (typeof r.body.content === 'string') {
    return Buffer.from(r.body.content.replace(/\n/g, ''), 'base64').toString('utf8');
  }
  if (r.body.download_url) {
    const txt = await fetch(r.body.download_url).then((x) => x.text());
    return txt;
  }
  return null;
}

// Commit new content to the data branch (no history growth, single file tree).
async function commitData(content) {
  const head = await ensureBranch();
  const meta = await gh(`/git/commits/${head}`);
  if (!meta.ok) throw new Error('cannot read branch head commit');
  const baseTree = meta.body.tree.sha;

  const blob = await gh(`/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content, encoding: 'utf-8' }),
  });
  if (!blob.ok) throw new Error('cannot create blob');
  const blobSha = blob.body.sha;

  const tree = await gh(`/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTree,
      tree: [{ path: FILEPATH, mode: '100644', type: 'blob', sha: blobSha }],
    }),
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
  if (!upd.ok) throw new Error('cannot update branch ref');
}

export async function loadDb(seed) {
  if (cachedDb && Date.now() - cachedAt < CACHE_TTL) return cachedDb;
  const text = await fetchData();
  let db = null;
  if (text) {
    try {
      db = JSON.parse(text);
    } catch {
      db = null;
    }
  }
  if (!db || !db.properties) {
    db = JSON.parse(JSON.stringify(seed));
  }
  db = normalize(db, seed);
  cachedDb = db;
  cachedAt = Date.now();
  // seed-to-storage on first run (best-effort, ignore if racing)
  if (!text) {
    writeLock = writeLock.then(() => commitData(JSON.stringify(db)).catch(() => {}));
  }
  return db;
}

export async function saveDb(db) {
  cachedDb = db;
  cachedAt = Date.now();
  const content = JSON.stringify(db);
  // serialize writes to avoid corrupting concurrent invocations
  writeLock = writeLock.then(() => commitData(content)).catch((e) => {
    // surface error so the API can respond honestly
    throw e;
  });
  return writeLock;
}

export function normalize(db, seed) {
  db.properties = db.properties ?? JSON.parse(JSON.stringify(seed.properties));
  db.services = db.services ?? JSON.parse(JSON.stringify(seed.services));
  db.bookings = db.bookings ?? [];
  db.leads = db.leads ?? [];
  db.settings = db.settings ?? { adminName: 'محمود الشريف', brand: 'Real Estate' };
  db.seq = db.seq ?? { booking: 0, lead: 0 };
  return db;
}
