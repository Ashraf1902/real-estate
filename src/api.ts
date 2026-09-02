import type { BookingRow, PropertyLead, Property } from './data/mock';

const BASE = '/api';
const ADMIN_KEY = 'admin_pass';

export function getAdminPass(): string {
  try { return sessionStorage.getItem(ADMIN_KEY) || ''; } catch { return ''; }
}
export function setAdminPass(p: string): void {
  try { if (p) sessionStorage.setItem(ADMIN_KEY, p); else sessionStorage.removeItem(ADMIN_KEY); } catch { /* ignore */ }
}
export function isAdminAuthed(): boolean {
  return !!getAdminPass();
}

async function authedFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const pass = getAdminPass();
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> || {}) };
  if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (pass) headers['X-Admin-Pass'] = pass;
  return fetch(url, { ...opts, headers });
}

export async function adminLogin(password: string): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const j = await r.json();
    if (j && j.ok) { setAdminPass(password); return true; }
    return false;
  } catch {
    return false;
  }
}
export async function adminLogout(): Promise<void> { setAdminPass(''); }

export interface NewBooking {
  customer: string;
  phone: string;
  property: string;
  service: string;
  downPayment?: number;
  status?: string;
  servi?: boolean;
}

export interface NewLead {
  name: string;
  phone: string;
  interest: string;
  stage?: string;
  value?: number;
  status?: string;
}

export async function fetchBookings(fallback: BookingRow[]): Promise<BookingRow[]> {
  try {
    const r = await fetch(`${BASE}/bookings`);
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as BookingRow[];
  } catch {
    return fallback;
  }
}

export async function createBooking(b: NewBooking): Promise<BookingRow | null> {
  try {
    const r = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    });
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as BookingRow;
  } catch {
    return null;
  }
}

export async function fetchLeads(fallback: PropertyLead[]): Promise<PropertyLead[]> {
  try {
    const r = await fetch(`${BASE}/leads`);
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as PropertyLead[];
  } catch {
    return fallback;
  }
}

export async function createLead(l: NewLead): Promise<PropertyLead | null> {
  try {
    const r = await fetch(`${BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(l),
    });
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as PropertyLead;
  } catch {
    return null;
  }
}

export async function fetchProperties(fallback: Property[]): Promise<Property[]> {
  try {
    const r = await fetch(`${BASE}/properties`);
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as Property[];
  } catch {
    return fallback;
  }
}

export async function fetchPropertyById(id: string, fallback: Property): Promise<Property> {
  try {
    const all = await fetchProperties([fallback]);
    return all.find((p) => p.id === id) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append('file', file);
    const headers: Record<string, string> = {};
    const pass = getAdminPass();
    if (pass) headers['X-Admin-Pass'] = pass;
    const r = await fetch(`${BASE}/upload`, { method: 'POST', body: fd, headers });
    if (!r.ok) throw new Error('bad');
    const j = await r.json();
    return j.url ?? null;
  } catch {
    return null;
  }
}

export async function createProperty(p: Partial<Property>): Promise<Property | null> {
  try {
    const r = await authedFetch(`${BASE}/properties`, {
      method: 'POST',
      body: JSON.stringify(p),
    });
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as Property;
  } catch {
    return null;
  }
}

export async function updateProperty(id: string, p: Partial<Property>): Promise<Property | null> {
  try {
    const r = await authedFetch(`${BASE}/properties/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(p),
    });
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as Property;
  } catch {
    return null;
  }
}

export async function deleteProperty(id: string): Promise<boolean> {
  try {
    const r = await authedFetch(`${BASE}/properties/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return r.ok;
  } catch {
    return false;
  }
}

export interface ServiceItem {
  id: string;
  name: string;
  kind: string;
  price: number;
  unit: string;
  desc: string;
}

export async function fetchServices(fallback: ServiceItem[]): Promise<ServiceItem[]> {
  try {
    const r = await fetch(`${BASE}/services`);
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as ServiceItem[];
  } catch {
    return fallback;
  }
}

export interface PaymentGate {
  name: string;
  on: boolean;
}

export interface PixelsSettings {
  meta: boolean;
  gtm: boolean;
  tiktok: boolean;
}

export interface CouponItem {
  code: string;
  discount: string;
  type: string;
  valid: string;
  uses: number;
  on: boolean;
}

export interface AppSettings {
  adminName: string;
  brand: string;
  maintenance: boolean;
  maintenanceMessage: string;
  rtl: boolean;
  forceSecure: boolean;
  emailNotify: boolean;
  gates: PaymentGate[];
  pixels: PixelsSettings;
  coupons: CouponItem[];
  orderBumpOn: boolean;
  upsellOn: boolean;
  landingBlocks?: { id: string; mutable: string; cta: string; delta: number }[];
  abTraffic?: number;
  distributeVisitors?: boolean;
  activeAbVersion?: string;
}

export const defaultSettings: AppSettings = {
  adminName: 'محمود الشريف',
  brand: 'Real Estate',
  maintenance: false,
  maintenanceMessage: 'نعود قريبًا بعد تطوير الفانل',
  rtl: true,
  forceSecure: true,
  emailNotify: true,
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
};

export async function fetchSettings(fallback?: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const r = await fetch(`${BASE}/settings`);
    if (!r.ok) throw new Error('bad');
    const s = (await r.json()) as Partial<AppSettings>;
    return { ...defaultSettings, ...s, gates: [...defaultSettings.gates, ...(s.gates || [])], pixels: { ...defaultSettings.pixels, ...(s.pixels || {}) } };
  } catch {
    return { ...defaultSettings, ...fallback } as AppSettings;
  }
}

export async function updateSettings(s: Partial<AppSettings>): Promise<AppSettings | null> {
  try {
    const r = await authedFetch(`${BASE}/settings`, {
      method: 'PUT',
      body: JSON.stringify(s),
    });
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as AppSettings;
  } catch {
    return null;
  }
}

export interface Summary {
  bookingsCount: number;
  confirmed: number;
  leadsCount: number;
  totalValue: number;
  hasServices: number;
  conv: number;
  funnel: { id: string; label: string; visitors: number; pct: number }[];
}

export async function fetchSummary(fallback: Summary): Promise<Summary> {
  try {
    const r = await fetch(`${BASE}/summary`);
    if (!r.ok) throw new Error('bad');
    return (await r.json()) as Summary;
  } catch {
    return fallback;
  }
}
