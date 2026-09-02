import { useState, useEffect } from 'react';
import { Download, FileText, SlidersHorizontal, Search } from 'lucide-react';
import { bookings } from '../../data/mock';
import type { BookingRow } from '../../data/mock';
import { useToast } from './AdminLayout';
import { fetchBookings } from '../../api';

const statusMap: Record<string, { c: string; l: string }> = {
  'مؤكد': { c: 'green', l: 'مؤكد' },
  'قيد المراجعة': { c: 'amber', l: 'قيد المراجعة' },
  'تم التسليم': { c: 'blue', l: 'تم التسليم' },
  'ملغي': { c: 'red', l: 'ملغي' },
};

export default function Orders() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);
  const [onlyServices, setOnlyServices] = useState(false);
  const [withDown, setWithDown] = useState(false);
  const [rows, setRows] = useState<BookingRow[]>(bookings);
  const statuses = ['الكل', 'مؤكد', 'قيد المراجعة', 'تم التسليم', 'ملغي'];

  useEffect(() => {
    let alive = true;
    fetchBookings(bookings).then((data) => { if (alive) setRows(data); });
    return () => { alive = false; };
  }, []);

  const resetFilters = () => { setOnlyServices(false); setWithDown(false); setStatus('الكل'); toast('تم تصفير الفلاتر'); };

  const filtered = rows.filter((o) => {
    const matchStatus = status === 'الكل' || o.status === status;
    const matchQ = o.customer.toLowerCase().includes(q.toLowerCase()) || o.id.toLowerCase().includes(q.toLowerCase()) || o.property.includes(q);
    const matchServices = !onlyServices || o.servi;
    const matchDown = !withDown || o.downPayment > 0;
    return matchStatus && matchQ && matchServices && matchDown;
  });

  const exportCSV = () => {
    const rows = [['المعرف', 'العميل', 'الهاتف', 'الوحدة', 'الخدمات', 'المقدم', 'الحالة', 'التاريخ']].concat(
      filtered.map((o) => [o.id, o.customer, o.phone, o.property, o.service, String(o.downPayment), o.status, o.date])
    );
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bookings.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('تم تصدير ملف Excel/CSV');
  };

  return (
    <div>
      <div className="export-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', background: '#fff', border: '1.5px solid var(--line)', borderRadius: 10, padding: '.5rem .8rem' }}>
          <Search size={16} color="var(--ink-soft)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالعميل أو الوحدة أو رقم الحجز…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '.88rem', width: 240 }} />
        </div>
        <button className={`btn-ghost ${showFilters ? 'on' : ''}`} onClick={() => setShowFilters((v) => !v)}><SlidersHorizontal size={15} /> فلترة</button>
        <span style={{ marginInlineStart: 'auto' }} />
        <button className="btn-ghost" onClick={exportCSV}><FileText size={15} /> CSV</button>
        <button className="btn-solid" onClick={exportCSV}><Download size={15} /> تصدير Excel</button>
      </div>

      {showFilters && (
        <div className="panel" style={{ marginBottom: '1rem' }}>
          <div className="panel-head"><h3><SlidersHorizontal size={18} /> فلترة متقدمة</h3>
            <button className="btn-ghost" style={{ padding: '.3rem .6rem', fontSize: '.78rem' }} onClick={resetFilters}>تصفير</button></div>
          <div className="panel-body" style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.86rem', fontWeight: 700 }}>
              <input type="checkbox" checked={onlyServices} onChange={(e) => setOnlyServices(e.target.checked)} /> حجوزات بطلبات خدمات فقط
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.86rem', fontWeight: 700 }}>
              <input type="checkbox" checked={withDown} onChange={(e) => setWithDown(e.target.checked)} /> بمقدم مدفوع فقط
            </label>
          </div>
        </div>
      )}

      <div className="tabs num">
        {statuses.map((s) => (
          <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>
            {s} {s === 'الكل' ? `(${rows.length})` : `(${rows.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>رقم الحجز</th><th>العميل</th><th>الوحدة</th><th>الخدمات</th><th>المقدم</th><th>الحالة</th><th>التاريخ</th></tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 800 }}>{o.id}</td>
                  <td><b>{o.customer}</b><div style={{ fontSize: '.75rem', color: 'var(--ink-soft)' }}>{o.phone}</div></td>
                  <td style={{ fontSize: '.84rem' }}>{o.property}</td>
                  <td style={{ fontSize: '.84rem' }}>{o.service}{o.servi && <span className="pill on" style={{ marginInlineStart: '.4rem' }}>services ✓</span>}</td>
                  <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 800, color: 'var(--emerald)' }}>{o.downPayment.toLocaleString('ar-EG')} ج.م</td>
                  <td><span className={`badge ${statusMap[o.status].c}`}>{statusMap[o.status].l}</span></td>
                  <td className="num" style={{ fontSize: '.82rem', color: 'var(--ink-soft)' }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--ink-soft)', marginTop: '.8rem' }}>عرض {filtered.length} من أصل {rows.length} حجز · <b style={{ color: 'var(--emerald)' }}>{rows.filter((o) => o.status === 'مؤكد').length} مؤكد</b></div>
    </div>
  );
}
