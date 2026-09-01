// Vercel Serverless API — single catch-all handler for every /api/* route.
// Persistence is via Upstash Redis REST (see store.mjs). Local dev still uses
// server/index.mjs; this file is only for the production (Vercel) deployment.

import { seedProperties, seedServices } from '../server/seed.mjs';
import { loadDb, saveDb } from './store.mjs';

const seed = {
  seq: { booking: 0, lead: 0 },
  bookings: [],
  leads: [],
  properties: JSON.parse(JSON.stringify(seedProperties)),
  services: JSON.parse(JSON.stringify(seedServices)),
  settings: { adminName: 'محمود الشريف', brand: 'Real Estate' },
};

function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const json = (res, code, data) => {
  res.status(code).json(data);
};

async function readBody(req) {
  // Many Vercel Node runtimes populate req.body already.
  if (req.body) {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
    if (typeof req.body === 'object') return req.body;
  }
  // Fetch-like request object.
  if (typeof req.text === 'function') {
    try { return JSON.parse(await req.text() || '{}'); } catch { return {}; }
  }
  // Node IncomingMessage stream.
  return new Promise((resolve) => {
    let data = '';
    let done = false;
    const finish = (raw) => {
      if (done) return;
      done = true;
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
    };
    try {
      req.on('data', (c) => (data += c));
      req.on('end', () => finish(data));
      req.on('error', () => finish(''));
    } catch {
      finish('');
    }
    // Safety: never hang a request. Vercel stream may be consumed already.
    setTimeout(() => finish(data), 2000);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  let db;
  try {
    db = await loadDb(seed);
  } catch (e) {
    json(res, 500, { error: 'DB unavailable: ' + e.message });
    return;
  }

  const path = req.url.split('?')[0];

  // HEALTH
  if (path === '/api/health') return json(res, 200, { ok: true });

  // UPLOAD
  if (path === '/api/upload') {
    // Note: image -> WebP needs sharp; keep body under Vercel limits.
    json(res, 501, { error: 'Image upload is not supported on the serverless deployment — use the image URL field or the local server.' });
    return;
  }

  // BOOKINGS
  if (path === '/api/bookings' && req.method === 'GET') return json(res, 200, db.bookings);
  if (path === '/api/bookings' && req.method === 'POST') {
    const b = await readBody(req);
    db.seq.booking += 1;
    const row = {
      id: `#BK-${db.seq.booking}`,
      customer: b.customer || '—',
      phone: b.phone || '—',
      property: b.property || '—',
      service: b.service || 'بدون خدمات',
      downPayment: Number(b.downPayment) || 0,
      status: b.status || 'قيد المراجعة',
      date: nowStr(),
      servi: Boolean(b.servi),
    };
    db.bookings.unshift(row);
    await saveDb(db);
    return json(res, 201, row);
  }
  if (path.startsWith('/api/bookings/') && req.method === 'DELETE') {
    const id = decodeURIComponent(path.split('/').pop());
    const before = db.bookings.length;
    db.bookings = db.bookings.filter((x) => x.id !== id);
    if (db.bookings.length === before) return json(res, 404, { error: 'not found' });
    await saveDb(db);
    return json(res, 200, { ok: true });
  }

  // LEADS
  if (path === '/api/leads' && req.method === 'GET') return json(res, 200, db.leads);
  if (path === '/api/leads' && req.method === 'POST') {
    const l = await readBody(req);
    db.seq.lead += 1;
    const row = {
      id: `#L-${db.seq.lead}`,
      name: l.name || '—',
      phone: l.phone || '—',
      interest: l.interest || '—',
      stage: l.stage || 'تأكيد الحجز',
      value: Number(l.value) || 0,
      date: nowStr(),
      status: l.status || 'جديد',
    };
    db.leads.unshift(row);
    await saveDb(db);
    return json(res, 201, row);
  }

  // PROPERTIES
  if (path === '/api/properties' && req.method === 'GET') return json(res, 200, db.properties);
  if (path === '/api/properties' && req.method === 'POST') {
    const b = await readBody(req);
    const id = b.id || `P-${Date.now().toString().slice(-5)}`;
    const row = { ...b, id };
    db.properties.unshift(row);
    await saveDb(db);
    return json(res, 201, row);
  }
  if (path.startsWith('/api/properties/') && req.method === 'PUT') {
    const id = decodeURIComponent(path.split('/').pop());
    const idx = db.properties.findIndex((p) => p.id === id);
    if (idx === -1) return json(res, 404, { error: 'not found' });
    const b = await readBody(req);
    db.properties[idx] = { ...db.properties[idx], ...b, id };
    await saveDb(db);
    return json(res, 200, db.properties[idx]);
  }
  if (path.startsWith('/api/properties/') && req.method === 'DELETE') {
    const id = decodeURIComponent(path.split('/').pop());
    const before = db.properties.length;
    db.properties = db.properties.filter((p) => p.id !== id);
    if (db.properties.length === before) return json(res, 404, { error: 'not found' });
    await saveDb(db);
    return json(res, 200, { ok: true });
  }

  // SERVICES
  if (path === '/api/services' && req.method === 'GET') return json(res, 200, db.services);

  // SETTINGS
  if (path === '/api/settings' && req.method === 'GET') return json(res, 200, db.settings);
  if (path === '/api/settings' && req.method === 'PUT') {
    const b = await readBody(req);
    db.settings = { ...db.settings, ...b };
    await saveDb(db);
    return json(res, 200, db.settings);
  }

  // SUMMARY
  if (path === '/api/summary' && req.method === 'GET') {
    const totalValue = db.bookings.reduce((s, x) => s + (Number(x.downPayment) || 0), 0);
    const confirmed = db.bookings.filter((x) => x.status === 'مؤكد').length;
    const hasServices = db.bookings.filter((x) => x.servi).length;
    const conv = db.leads.length > 0 ? Math.round((db.bookings.length / db.leads.length) * 100) : 0;
    const funnel = [
      { id: 'landing', label: 'صفحة الهبوط (المعرض)', visitors: db.leads.length + db.bookings.length + 40, pct: 100 },
      { id: 'checkout', label: 'صفحة الحجز', visitors: db.leads.length, pct: db.leads.length ? Math.round((db.leads.length / (db.leads.length + 40)) * 100) : 0 },
      { id: 'confirmed', label: 'تأكيد الحجز', visitors: db.bookings.length, pct: conv },
    ];
    return json(res, 200, {
      bookingsCount: db.bookings.length,
      confirmed,
      leadsCount: db.leads.length,
      totalValue,
      hasServices,
      conv,
      funnel,
    });
  }

  json(res, 404, { error: 'not found' });
}
