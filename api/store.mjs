// Shared Upstash Redis REST persistence for the Vercel serverless API.
// The whole app state is stored as a single JSON document under one key.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
const KEY = 'realestate:db';

let cachedDb = null;
let cachedAt = 0;
const CACHE_TTL = 60 * 1000; // 60s in-process cache to cut Redis calls

function command(cmd) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error('UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not configured');
  }
  return fetch(`${UPSTASH_URL}/${cmd}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  }).then(async (r) => {
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(`Upstash error: ${r.status} ${JSON.stringify(j)}`);
    return j;
  });
}

export async function loadDb(seed) {
  if (cachedDb && Date.now() - cachedAt < CACHE_TTL) return cachedDb;
  const j = await command(`get/${KEY}`);
  if (j && j.result != null) {
    let db;
    try {
      db = JSON.parse(j.result);
    } catch {
      db = null;
    }
    if (db && db.properties) {
      cachedDb = normalize(db, seed);
      cachedAt = Date.now();
      return cachedDb;
    }
  }
  // seed on first run
  const fresh = normalize(JSON.parse(JSON.stringify(seed)), seed);
  await command(`set/${KEY}/${encodeURIComponent(JSON.stringify(fresh))}`);
  cachedDb = fresh;
  cachedAt = Date.now();
  return fresh;
}

export async function saveDb(db) {
  cachedDb = db;
  cachedAt = Date.now();
  await command(`set/${KEY}/${encodeURIComponent(JSON.stringify(db))}`);
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
