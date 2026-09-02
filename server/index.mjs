import http from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import sharp from 'sharp';
import Busboy from 'busboy';
import { seedProperties, seedServices } from './seed.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');
const UPLOADS_DIR = join(__dirname, '..', 'public', 'uploads');
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
const PORT = process.env.PORT || 4000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'devpass123';

const seed = {
  seq: { booking: 0, lead: 0 },
  bookings: [],
  leads: [],
  properties: JSON.parse(JSON.stringify(seedProperties)),
  services: JSON.parse(JSON.stringify(seedServices)),
  settings: { adminName: 'محمود الشريف', brand: 'Real Estate' },
};

function load() {
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(seed));
  }
  try {
    const d = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    // ensure new collections exist for older files
    d.properties = d.properties ?? JSON.parse(JSON.stringify(seedProperties));
    d.services = d.services ?? JSON.parse(JSON.stringify(seedServices));
    d.settings = d.settings ?? { adminName: 'محمود الشريف', brand: 'Real Estate' };
    return d;
  } catch {
    return JSON.parse(JSON.stringify(seed));
  }
}

let db = load();

function save() {
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pass',
};

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

function handleUpload(req, res) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Expected multipart/form-data' }));
  }

  const busboy = Busboy({ headers: { 'content-type': contentType }, limits: { fileSize: 10 * 1024 * 1024 } });
  let fileBuffer = null;
  let origName = '';

  busboy.on('file', (_fieldname, file, info) => {
    origName = info.filename || 'upload.jpg';
    const chunks = [];
    file.on('data', (chunk) => chunks.push(chunk));
    file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
  });

  busboy.on('finish', async () => {
    if (!fileBuffer) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No file uploaded' }));
    }
    const outName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const outPath = join(UPLOADS_DIR, outName);
    try {
      await sharp(fileBuffer)
        .resize({ width: 1200, height: 900, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outPath);
      res.writeHead(201, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: `/uploads/${outName}`, originalName: origName }));
    } catch (err) {
      res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Conversion failed: ' + err.message }));
    }
  });

  req.pipe(busboy);
}

function isAdmin(req) {
  if (!ADMIN_PASS) return false;
  return (req.headers['x-admin-pass'] || req.headers['X-Admin-Pass'] || '') === ADMIN_PASS;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const send = (code, data) => {
    res.writeHead(code, { ...CORS, 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // HEALTH
  if (path === '/api/health' && req.method === 'GET') return send(200, { ok: true });

  // AUTH
  if (path === '/api/auth' && req.method === 'POST') {
    const b = await readBody(req);
    if (ADMIN_PASS && b && b.password && b.password === ADMIN_PASS) {
      return send(200, { ok: true });
    }
    return send(401, { ok: false });
  }

  // ---- UPLOAD (image -> webp) ----
  if (path === '/api/upload' && req.method === 'POST') {
    if (!isAdmin(req)) return send(401, { error: 'unauthorized' });
    return handleUpload(req, res);
  }

  // ---- BOOKINGS ----
  if (path === '/api/bookings' && req.method === 'GET') return send(200, db.bookings);
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
    save();
    return send(201, row);
  }
  if (path.startsWith('/api/bookings/') && req.method === 'DELETE') {
    if (!isAdmin(req)) return send(401, { error: 'unauthorized' });
    const id = decodeURIComponent(path.split('/').pop());
    const before = db.bookings.length;
    db.bookings = db.bookings.filter((x) => x.id !== id);
    if (db.bookings.length === before) return send(404, { error: 'not found' });
    save();
    return send(200, { ok: true });
  }

  // ---- LEADS ----
  if (path === '/api/leads' && req.method === 'GET') return send(200, db.leads);
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
    save();
    return send(201, row);
  }

  // ---- PROPERTIES ----
  if (path === '/api/properties' && req.method === 'GET') return send(200, db.properties);
  if (path === '/api/properties' && req.method === 'POST') {
    if (!isAdmin(req)) return send(401, { error: 'unauthorized' });
    const b = await readBody(req);
    const id = b.id || `P-${Date.now().toString().slice(-5)}`;
    const row = { ...b, id };
    db.properties.unshift(row);
    save();
    return send(201, row);
  }
  if (path.startsWith('/api/properties/') && req.method === 'PUT') {
    if (!isAdmin(req)) return send(401, { error: 'unauthorized' });
    const id = decodeURIComponent(path.split('/').pop());
    const idx = db.properties.findIndex((p) => p.id === id);
    if (idx === -1) return send(404, { error: 'not found' });
    const b = await readBody(req);
    db.properties[idx] = { ...db.properties[idx], ...b, id };
    save();
    return send(200, db.properties[idx]);
  }
  if (path.startsWith('/api/properties/') && req.method === 'DELETE') {
    if (!isAdmin(req)) return send(401, { error: 'unauthorized' });
    const id = decodeURIComponent(path.split('/').pop());
    const before = db.properties.length;
    db.properties = db.properties.filter((p) => p.id !== id);
    if (db.properties.length === before) return send(404, { error: 'not found' });
    save();
    return send(200, { ok: true });
  }

  // ---- SERVICES ----
  if (path === '/api/services' && req.method === 'GET') return send(200, db.services);

  // ---- SETTINGS ----
  if (path === '/api/settings' && req.method === 'GET') return send(200, db.settings);
  if (path === '/api/settings' && req.method === 'PUT') {
    if (!isAdmin(req)) return send(401, { error: 'unauthorized' });
    const b = await readBody(req);
    db.settings = { ...db.settings, ...b };
    save();
    return send(200, db.settings);
  }

  // ---- SUMMARY (real stats from real bookings/leads) ----
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
    return send(200, {
      bookingsCount: db.bookings.length,
      confirmed,
      leadsCount: db.leads.length,
      totalValue,
      hasServices,
      conv,
      funnel,
    });
  }

  send(404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`[backend] Real Estate API listening on http://localhost:${PORT}`);
});
