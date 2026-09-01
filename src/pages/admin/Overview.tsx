import { useEffect, useRef, useState } from 'react';
import {
  ChartColumn, TrendingUp, ShoppingBag, MousePointerClick, ArrowUpRight, ArrowDownRight,
  Fuel, CreditCard, Users, Eye, Activity, DollarSign, Wallet, GitFork, Check, Building2, Landmark,
} from 'lucide-react';
import { Bookmark } from 'lucide-react';
import { fetchBookings, fetchLeads } from '../../api';
import type { BookingRow, PropertyLead } from '../../data/mock';
import { useRange, rangeLabel } from './AdminLayout';
import type { RangeKey } from './AdminLayout';

const RANGE_DAYS: Record<RangeKey, number> = { '30': 30, '7': 7, '1': 1 };

function toDate(s: string): Date {
  return new Date(s.replace(' ', 'T'));
}

function inRange(dateStr: string, days: number | null): boolean {
  if (days === null) return true;
  const d = toDate(dateStr);
  const now = new Date();
  return now.getTime() - d.getTime() <= days * 24 * 3600 * 1000;
}

function useCountUp(target: number, dur = 1200) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => cancelAnimationFrame(t0 as number);
  }, [target, dur]);
  return { ref, val };
}

function DoCount({ to }: { to: number }) {
  const { ref, val } = useCountUp(to);
  return <span ref={ref} className="num">{val.toLocaleString('ar-EG')}</span>;
}

interface FunnelStep {
  id: string;
  label: string;
  visitors: number;
  pct: number;
}

function FunnelVisualizer({ data }: { data: FunnelStep[] }) {
  const max = Math.max(28, ...data.map((s) => s.visitors));
  return (
    <div className="funnel">
      {data.map((s, i) => {
        const width = Math.max(28, (s.visitors / max) * 100);
        const colors = ['linear-gradient(135deg,#0F2A43,#1E5E86)', 'linear-gradient(135deg,#0A4652,#115E6B)', 'linear-gradient(135deg,#E8A33D,#F3C877)', 'linear-gradient(135deg,#7A5DE8,#9A84EE)', 'linear-gradient(135deg,#0E9C74,#2BB48D)'];
        const drop = i > 0 ? 100 - Math.round((s.visitors / data[i - 1].visitors) * 100) : 0;
        return (
          <div className="fstep" key={s.id}>
            <div className="fstep-bar">
              <span className="fstep-n num" style={{ background: colors[i] }}>{i + 1}</span>
              <div className="fstep-w num" style={{ width: `${width}%`, background: colors[i], color: '#fff' }}>
                <span>{s.label}</span>
                <span className="fv">{s.visitors.toLocaleString('ar-EG')}
                  <span className="fd num" style={{ marginInlineStart: '.4rem' }}>· {s.pct}%</span>
                </span>
              </div>
            </div>
            {drop > 0 && <span className="fstep-drop num">-{drop}%</span>}
          </div>
        );
      })}
    </div>
  );
}

function Donut({ pct, label, color }: { pct: number; label: string; color: string }) {
  return (
    <div className="donut" style={{ background: `conic-gradient(${color} ${Math.min(pct, 100) * 3.6}deg, #E9EEF5 0deg)` }}>
      <div className="dc num">{Math.round(pct)}%</div>
    </div>
  );
}

function Bars({ data }: { data: { d: string; v: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.v));
  return (
    <div className="bars num">
      {data.map((d) => (
        <div className="bar" key={d.d}>
          <span className="bv">{d.v}</span>
          <div className="fill" style={{ height: `${(d.v / max) * 100}%` }} />
          <span className="bl">{d.d}</span>
        </div>
      ))}
    </div>
  );
}

const iconMap: Record<string, React.ReactNode> = {
  'إجمالي قيمة الحجوزات': <DollarSign size={20} />,
  'متوسط حجم الحجز (AOV)': <ShoppingBag size={20} />,
  'العملاء المحتملون (Leads)': <Users size={20} />,
  'نسبة التحويل': <MousePointerClick size={20} />,
};
const bgMap: Record<string, string> = {
  'إجمالي قيمة الحجوزات': 'var(--emerald-bg);color:var(--emerald)',
  'متوسط حجم الحجز (AOV)': 'var(--sky-bg);color:var(--sky)',
  'العملاء المحتملون (Leads)': 'var(--vio-bg);color:var(--vio)',
  'نسبة التحويل': '#FFF6DA;color:#b57f26',
};

const weekdayAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function Overview() {
  const range = useRange();
  const days = RANGE_DAYS[range];
  const [allBookings, setAllBookings] = useState<BookingRow[]>([]);
  const [allLeads, setAllLeads] = useState<PropertyLead[]>([]);

  useEffect(() => {
    fetchBookings([]).then(setAllBookings).catch(() => {});
    fetchLeads([]).then(setAllLeads).catch(() => {});
  }, []);

  const bookings = allBookings.filter((b) => inRange(b.date, days));
  const leads = allLeads.filter((l) => inRange(l.date, days));

  const totalValue = bookings.reduce((s, b) => s + (Number(b.downPayment) || 0), 0);
  const aov = bookings.length ? Math.round(totalValue / bookings.length) : 0;
  const conv = leads.length ? Math.round((bookings.length / leads.length) * 100) : 0;
  const hasServices = bookings.filter((b) => b.servi).length;
  const serviPct = bookings.length ? Math.round((hasServices / bookings.length) * 100) : 0;
  const confirmed = bookings.filter((b) => b.status === 'مؤكد').length;
  const confPct = bookings.length ? Math.round((confirmed / bookings.length) * 100) : 0;

  const funnelData: FunnelStep[] = [
    { id: 'landing', label: 'صفحة المعرض', visitors: Math.max(leads.length + bookings.length, 1), pct: 100 },
    { id: 'checkout', label: 'صفحة الحجز', visitors: Math.max(leads.length, 1), pct: conv },
    { id: 'confirmed', label: 'تأكيد الحجز', visitors: Math.max(bookings.length, 1), pct: conv },
  ];

  const byStage = new Map<string, number>();
  leads.forEach((l) => byStage.set(l.stage, (byStage.get(l.stage) ?? 0) + 1));

  const weekData = weekdayAr.map((d) => ({ d, v: bookings.filter((b) => weekdayAr[toDate(b.date).getDay()] === d).length }));

  const stats = [
    { label: 'إجمالي قيمة الحجوزات', value: totalValue, suffix: 'ج.م', up: bookings.length >= 1, delta: bookings.length ? 12 : 0 },
    { label: 'متوسط حجم الحجز (AOV)', value: aov, suffix: 'ج.م', up: true, delta: 0 },
    { label: 'العملاء المحتملون (Leads)', value: leads.length, suffix: '', up: leads.length > 0, delta: leads.length ? 8 : 0 },
    { label: 'نسبة التحويل', value: conv, suffix: '%', up: conv >= 20, delta: 0 },
  ];

  const convRows = [
    { l: 'من المعرض إلى صفحة الحجز', p: leads.length ? Math.min(100, Math.round(((leads.length + bookings.length) / Math.max(leads.length + bookings.length, 1)) * 100)) : 100 },
    { l: 'من الحجز إلى التأكيد', p: Math.min(100, Math.max(confPct, 1)) },
    { l: 'قبول الخدمات الإضافية', p: Math.min(100, Math.max(serviPct, 1)) },
  ];

  const notes = [
    bookings.length ? `لديك ${bookings.length} حجوزات في ${rangeLabel[range]} بقيمة إجمالية ${totalValue.toLocaleString('ar-EG')} ج.م.` : `لا توجد حجوزات بعد في ${rangeLabel[range]} — شارك الرابط لتعبئة الفانل.`,
    `عدد العملاء المحتملين ${leads.length} · نسبة التحويل إلى حجز ${conv}%.`,
    serviPct > 0 ? `الخدمات الإضافية مقبولة في ${serviPct}% من الحجوزات.` : 'أضف خدمات مثل التشطيب والأثاث لرفع قيمة الحجز (من صفحة الوحدات والخدمات).',
  ];

  return (
    <div>
      {/* stats */}
      <div className="stats">
        {stats.map((m) => (
          <div className="stat" key={m.label}>
            <div className="s-ico" style={{ background: bgMap[m.label].split(';')[0], color: bgMap[m.label].split(';')[1] }}>{iconMap[m.label]}</div>
            <b>{m.label}</b>
            <div className="s-val num"><DoCount to={m.value} /> {m.suffix === '%' ? '%' : m.suffix ? <span style={{ fontSize: '.95rem' }}>{m.suffix}</span> : null}</div>
            <span className={`s-delta ${m.up ? 'up' : 'dn'}`}>
              {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {m.delta}%
            </span>
          </div>
        ))}
      </div>

      <div className="grid2">
        {/* Funnel visualizer */}
        <div className="panel">
          <div className="panel-head"><h3><GitFork size={18} /> مخطط الفانل</h3><span className="meta"><Activity size={13} style={{ verticalAlign: '-2px' }} /> {rangeLabel[range]}</span></div>
          <div className="panel-body"><FunnelVisualizer data={funnelData} /></div>
        </div>

        {/* Leads by stage */}
        <div className="panel">
          <div className="panel-head"><h3><Users size={18} /> العملاء حسب المرحلة</h3><span className="meta">{rangeLabel[range]}</span></div>
          <div className="panel-body">
            {byStage.size === 0 && <div style={{ color: 'var(--ink-soft)', fontSize: '.85rem', fontWeight: 600 }}>لا يوجد عملاء محتملون بعد.</div>}
            {[...byStage.entries()].map(([stage, n]) => (
              <div key={stage} className="legend num" style={{ marginBottom: '.5rem' }}>
                <div className="lg"><i style={{ background: ['#0E9C74', '#3E8FD9', '#E8A33D', '#7A5DE8'][([...byStage.keys()].indexOf(stage)) % 4] }} /> {stage === 'جديد' ? 'استعلام جديد' : stage} <span className="lm">{n}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid3">
        {/* Weekly sales chart */}
        <div className="panel">
          <div className="panel-head"><h3><ChartColumn size={18} /> مبيعات الأسبوع</h3><span className="meta">{rangeLabel[range]}</span></div>
          <div className="panel-body"><Bars data={weekData} /></div>
        </div>

        {/* Conversion mini */}
        <div className="panel">
          <div className="panel-head"><h3><MousePointerClick size={18} /> أداء التحويل</h3></div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            {convRows.map((r) => (
              <div key={r.l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 800, marginBottom: '.3rem' }}>
                  <span>{r.l}</span><span className="num" style={{ color: 'var(--navy-2)' }}>{r.p}%</span>
                </div>
                <div style={{ height: 9, background: '#E9EEF5', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.p}%`, background: 'linear-gradient(90deg,var(--sky),var(--emerald))', borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="panel">
          <div className="panel-head"><h3><CreditCard size={18} /> أحدث الحجوزات</h3><span className="meta num">في {rangeLabel[range]}</span></div>
          <ul className="mini-orders">
            {bookings.slice(0, 4).map((o) => (
              <li className="mini-order" key={o.id}>
                <div className="av num">{(o.customer || '؟').charAt(0)}</div>
                <div><b>{o.customer}</b><span>{o.property}</span></div>
                <span className="amt num">{(Number(o.downPayment) || 0).toLocaleString('ar-EG')} ج.م</span>
              </li>
            ))}
            {bookings.length === 0 && <li className="mini-order" style={{ color: 'var(--ink-soft)', fontSize: '.85rem' }}>لا حجوزات في هذه الفترة.</li>}
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3><Eye size={18} /> ملاحظات الأداء الذكية</h3></div>
        <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {notes.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', background: i === 2 ? 'var(--coral-bg)' : '#FAFBFF', padding: '.7rem .9rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600 }}>
              <span style={{ color: i === 2 ? 'var(--coral)' : 'var(--emerald)' }}>{i === 2 ? <Fuel size={16} /> : <Check size={16} />}</span>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}