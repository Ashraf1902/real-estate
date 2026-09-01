import { createContext, useCallback, useState, useContext, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, GitFork, ShoppingCart, Users, Package, Settings, ExternalLink,
  Bell, Check,
} from 'lucide-react';

const ToastCtx = createContext<(msg: string) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export type RangeKey = '30' | '7' | '1';
const RangeCtx = createContext<RangeKey>('30');

export function useRange() {
  return useContext(RangeCtx);
}

export const rangeLabel: Record<RangeKey, string> = {
  '30': 'آخر 30 يوم',
  '7': 'آخر أسبوع',
  '1': 'اليوم',
};

const SettingsCtx = createContext<string>('محمود الشريف');

export function useAdminName() {
  return useContext(SettingsCtx);
}

const nav = [
  { to: '/admin', label: 'التحليلات', Icon: LayoutDashboard, end: true },
  { to: '/admin/builder', label: 'بناء الفانل', Icon: GitFork },
  { to: '/admin/orders', label: 'الحجوزات', Icon: ShoppingCart },
  { to: '/admin/leads', label: 'العملاء المحتملون', Icon: Users },
  { to: '/admin/products', label: 'الوحدات والخدمات', Icon: Package },
  { to: '/admin/settings', label: 'الإعدادات', Icon: Settings },
];

export function AdminLayout() {
  const [toast, setToast] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>('30');
  const [adminName, setAdminName] = useState('محمود الشريف');
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    fetch('/api/settings').then((r) => (r.ok ? r.json() : null)).then((s) => {
      if (s && s.adminName) setAdminName(s.adminName);
    }).catch(() => {});
    fetch('/api/summary').then((r) => (r.ok ? r.json() : null)).then((sum) => {
      if (sum) setLeadsCount(sum.leadsCount);
    }).catch(() => {});
  }, []);

  return (
    <RangeCtx.Provider value={range}>
      <ToastCtx.Provider value={showToast}>
        <SettingsCtx.Provider value={adminName}>
        <div className="admin">
          <aside className="sb">
            <Link to="/" className="sb-brand">
              <img src="/logo.png" alt="Real Estate" className="logo" />
              Real Estate
            </Link>
            <div className="sb-user">
              <div className="av">{adminName.trim().charAt(0) || 'م'}</div>
              <div><b>{adminName}</b><span>مدير الفانل</span></div>
            </div>
            <nav className="sb-nav">
              {nav.map(({ to, label, Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `sb-link ${isActive ? 'on' : ''}`}>
                  <Icon size={18} /> {label}
                  {to === '/admin/leads' && leadsCount > 0 ? <span className="sb-badge num">{leadsCount}</span> : null}
                </NavLink>
              ))}
            </nav>
            <div className="sb-foot">
              <Link to="/" className="sb-viewlink"><ExternalLink size={15} /> معاينة الفانل</Link>
              <div style={{ marginTop: '.7rem' }}>آخر مزامنة: الآن</div>
            </div>
          </aside>

          <div className="main">
            <div className="adm-top">
              <div>
                <h1>لوحة تحكم الفانل</h1>
                <div className="sub">أهلًا {adminName} 👋 · نظرة على أداء الفانل في {rangeLabel[range]}</div>
              </div>
              <div className="adm-actions">
                <span className="period num">
                  <button className={range === '30' ? 'on' : ''} onClick={() => setRange('30')}>30 يوم</button>
                  <button className={range === '7' ? 'on' : ''} onClick={() => setRange('7')}>أسبوع</button>
                  <button className={range === '1' ? 'on' : ''} onClick={() => setRange('1')}>اليوم</button>
                </span>
                <button className="btn-solid" onClick={() => showToast('تم إنشاء نسخة احتياطية من بيانات الفانل')}><Bell size={16} /> إشعارات</button>
              </div>
            </div>
            <div className="adm-body">
              <Outlet />
            </div>
          </div>
          {toast && <div className="toast-live"><Check size={16} style={{ color: 'var(--emerald)', verticalAlign: '-2px', marginInlineEnd: '.35rem' }} />{toast}</div>}
        </div>
        </SettingsCtx.Provider>
      </ToastCtx.Provider>
    </RangeCtx.Provider>
  );
}

export function AdminTopMeta({ title, sub }: { title: string; sub: string }) {
  return <div style={{ marginBottom: '1.4rem' }}><h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 900 }}>{title}</h1><div className="sub" style={{ color: 'var(--ink-soft)' }}>{sub}</div></div>;
}
