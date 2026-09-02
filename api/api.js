// Vercel Serverless API — single catch-all handler for every /api/* route.
// Persistence via GitHub (see store.mjs). Auth: POST /api/auth verifies the
// admin password; admin CRUD mutations require the x-admin-pass header.

import { seedProperties, seedServices } from '../server/seed.mjs';
import { loadDb, saveDb, saveUpload } from './store.mjs';
import sharp from 'sharp';
import Busboy from 'busboy';

const seed = {
  seq: { booking: 0, lead: 0 },
  bookings: [],
  leads: [],
  properties: JSON.parse(JSON.stringify(seedProperties)),
  services: JSON.parse(JSON.stringify(seedServices)),
  settings: {
    adminName: 'محمود الشريف',
    brand: 'Real Estate',
    maintenance: false,
    rtl: true,
    forceSecure: true,
    emailNotify: true,
    maintenanceMessage: 'نعود قريبًا بعد تطوير الفانل',
    gates: [
      { name: 'فودافون كاش', on: true },
      { name: 'الدفع بالبطاقة (Visa/Master)', on: true },
      { name: 'التحويل البنكي', on: false },
      { name: 'محفظة موبي/أورانج', on: false },
    ],
    pixels: { meta: true, gtm: false, tiktok: false },
    coupons: [],
    orderBumpOn: true,
    upsellOn: true,
  },
};

const ADMIN_PASS = process.env.ADMIN_PASS || '';

function ok(res, code, data) {
  res.status(code).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function readRaw(req) {
  return new Promise((resolve) => {
    let data = '';
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(data); } };
    if (req.body && typeof req.body === 'string') { resolve(req.body); return; }
    try {
      req.on('data', (c) => (data += c));
      req.on('end', finish);
      req.on('error', finish);
    } catch { finish(); }
    setTimeout(finish, 4000);
  });
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await readRaw(req);
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

function isAdmin(req) {
  if (!ADMIN_PASS) return false;
  const h = req.headers['x-admin-pass'] || req.headers['X-Admin-Pass'];
  return !!h && h === ADMIN_PASS;
}

const adminMutation = (req, res) => {
  if (!isAdmin(req)) {
    ok(res, 401, { error: 'unauthorized' });
    return null;
  }
  return true;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Pass');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const path = req.url.split('?')[0];

  // AUTH
  if (path === '/api/auth' && req.method === 'POST') {
    const b = await readBody(req);
    if (ADMIN_PASS && b && b.password && b.password === ADMIN_PASS) {
      return ok(res, 200, { ok: true });
    }
    return ok(res, 401, { ok: false });
  }

  let db;
  try {
    db = await loadDb(seed);
  } catch (e) {
    ok(res, 500, { error: 'DB unavailable: ' + e.message });
    return;
  }

  // UPLOAD (admin only)
  if (path === '/api/upload' && req.method === 'POST') {
    if (!adminMutation(req, res)) return;
    const buffer = await new Promise((resolve) => {
      const bb = Busboy({ headers: { 'content-type': req.headers['content-type'] }, limits: { fileSize: 8 * 1024 * 1024 } });
      let chunks = [];
      bb.on('file', (_f, file) => {
        file.on('data', (c) => chunks.push(c));
        file.on('end', () => {});
      });
      bb.on('error', () => resolve(null));
      bb.on('finish', () => resolve(Buffer.concat(chunks)));
      try { req.pipe(bb); } catch { resolve(null); }
    }).catch(() => null);
    if (!buffer || buffer.length === 0) return ok(res, 400, { error: 'No file received' });
    try {
      const webp = await sharp(buffer).resize({ width: 1200, height: 900, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
      await saveUpload(name, webp);
      return ok(res, 201, { url: `/uploads/${name}` });
    } catch (e) {
      return ok(res, 500, { error: 'Conversion failed: ' + e.message });
    }
  }

  // BOOKINGS
  if (path === '/api/bookings' && req.method === 'GET') return ok(res, 200, db.bookings);
  if (path === '/api/bookings' && req.method === 'POST') {
    const b = await readBody(req);
    db.seq.booking += 1;
    const row = {
      id: `#BK-${db.seq.booking}`, customer: b.customer || '—', phone: b.phone || '—',
      property: b.property || '—', service: b.service || 'بدون خدمات',
      downPayment: Number(b.downPayment) || 0, status: b.status || 'قيد المراجعة',
      date: nowStr(), servi: Boolean(b.servi),
    };
    db.bookings.unshift(row);
    await saveDb(db);
    return ok(res, 201, row);
  }
  if (path.startsWith('/api/bookings/') && req.method === 'DELETE') {
    if (!adminMutation(req, res)) return;
    const id = decodeURIComponent(path.split('/').pop());
    const before = db.bookings.length;
    db.bookings = db.bookings.filter((x) => x.id !== id);
    if (db.bookings.length === before) return ok(res, 404, { error: 'not found' });
    await saveDb(db);
    return ok(res, 200, { ok: true });
  }

  // LEADS
  if (path === '/api/leads' && req.method === 'GET') return ok(res, 200, db.leads);
  if (path === '/api/leads' && req.method === 'POST') {
    const l = await readBody(req);
    db.seq.lead += 1;
    const row = {
      id: `#L-${db.seq.lead}`, name: l.name || '—', phone: l.phone || '—',
      interest: l.interest || '—', stage: l.stage || 'تأكيد الحجز',
      value: Number(l.value) || 0, date: nowStr(), status: l.status || 'جديد',
    };
    db.leads.unshift(row);
    await saveDb(db);
    return ok(res, 201, row);
  }

  // PROPERTIES
  if (path === '/api/properties' && req.method === 'GET') return ok(res, 200, db.properties);
  if (path === '/api/properties' && req.method === 'POST') {
    if (!adminMutation(req, res)) return;
    const b = await readBody(req);
    const id = b.id || `P-${Date.now().toString().slice(-5)}`;
    const row = { ...b, id };
    db.properties.unshift(row);
    await saveDb(db);
    return ok(res, 201, row);
  }
  if (path.startsWith('/api/properties/') && req.method === 'PUT') {
    if (!adminMutation(req, res)) return;
    const id = decodeURIComponent(path.split('/').pop());
    const idx = db.properties.findIndex((p) => p.id === id);
    if (idx === -1) return ok(res, 404, { error: 'not found' });
    const b = await readBody(req);
    db.properties[idx] = { ...db.properties[idx], ...b, id };
    await saveDb(db);
    return ok(res, 200, db.properties[idx]);
  }
  if (path.startsWith('/api/properties/') && req.method === 'DELETE') {
    if (!adminMutation(req, res)) return;
    const id = decodeURIComponent(path.split('/').pop());
    const before = db.properties.length;
    db.properties = db.properties.filter((p) => p.id !== id);
    if (db.properties.length === before) return ok(res, 404, { error: 'not found' });
    await saveDb(db);
    return ok(res, 200, { ok: true });
  }

  // SERVICES
  if (path === '/api/services' && req.method === 'GET') return ok(res, 200, db.services);

  // SETTINGS
  if (path === '/api/settings' && req.method === 'GET') return ok(res, 200, db.settings);
  if (path === '/api/settings' && req.method === 'PUT') {
    if (!adminMutation(req, res)) return;
    const b = await readBody(req);
    db.settings = { ...db.settings, ...b };
    await saveDb(db);
    return ok(res, 200, db.settings);
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
    return ok(res, 200, { bookingsCount: db.bookings.length, confirmed, leadsCount: db.leads.length, totalValue, hasServices, conv, funnel });
  }

  ok(res, 404, { error: 'not found' });
}
