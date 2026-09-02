import { useState, useEffect } from 'react';
import { Download, Search, Mail, Phone, UserPlus, Activity } from 'lucide-react';
import { propertyLeads as leadsData } from '../../data/mock';
import type { PropertyLead } from '../../data/mock';
import { useToast } from './AdminLayout';
import { fetchLeads } from '../../api';

const statusMap: Record<string, string> = {
  'جديد': 'blue',
  'تم التواصل': 'green',
  'على البارد': 'amber',
};

export default function Leads() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<PropertyLead[]>(leadsData);

  useEffect(() => {
    let alive = true;
    fetchLeads(leadsData).then((data) => { if (alive) setRows(data); });
    return () => { alive = false; };
  }, []);

  const filtered = rows.filter((l) => l.name.includes(q) || l.id.toLowerCase().includes(q.toLowerCase()));

  const exportCSV = () => {
    const lines = [['المعرف', 'الاسم', 'الهاتف', 'المرحلة', 'قيمة محتملة', 'الحالة', 'التاريخ']].concat(
      filtered.map((l) => [l.id, l.name, l.phone, l.stage, String(l.value), l.status, l.date])
    );
    const csv = lines.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('تم تصدير بيانات العملاء المحتملين');
  };

  const abandonedValue = rows.reduce((s, l) => s + l.value, 0);

  const contactLead = (l: PropertyLead) => {
    const digits = l.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`مرحبًا ${l.name}، من فريق Real Estate. تم استلام طلبك ونود متابعة تفاصيل استلام وحدتك 😊`);
    if (!digits) { toast(`لا يوجد رقم هاتف صحيح للتواصل مع ${l.name}`); return; }
    window.open(`https://wa.me/${digits}?text=${msg}`, '_blank');
    toast(`فتحنا محادثة واتساب مع ${l.name}`);
  };

  const bulkFollowUp = () => {
    if (!filtered.length) { toast('لا يوجد عملاء للمتابعة'); return; }
    const withPhone = filtered.filter((l) => l.phone.replace(/\D/g, ''));
    if (!withPhone.length) { toast('لا يوجد عملاء بأرقام صالحة'); return; }
    withPhone.forEach((l) => window.open(`https://wa.me/${l.phone.replace(/\D/g, '')}`, '_blank'));
    toast(`فتحنا ${withPhone.length} محادثة متابعة مع عملاء محتملين`);
  };

  return (
    <div>
      <div className="grid3" style={{ marginBottom: '1.4rem' }}>
        {[
          { l: 'عملاء محتملون (Leads)', v: rows.length, c: 'var(--sky)', bg: 'var(--sky-bg)', Icon: UserPlus },
          { l: 'من تركوا قبل الدفع', v: Math.round((rows.length / (rows.length + 6)) * 100) + '%', c: 'var(--coral)', bg: 'var(--coral-bg)', Icon: Activity },
          { l: 'قيمة محتملة ضائعة', v: `${abandonedValue.toLocaleString('ar-EG')} ج.م`, c: 'var(--gold)', bg: '#FFF6DA', Icon: Mail },
        ].map((s) => (
          <div className="stat" key={s.l}>
            <div className="s-ico" style={{ background: s.bg, color: s.c }}><s.Icon size={20} /></div>
            <b>{s.l}</b>
            <div className="s-val num">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="export-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', background: '#fff', border: '1.5px solid var(--line)', borderRadius: 10, padding: '.5rem .8rem' }}>
          <Search size={16} color="var(--ink-soft)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن عميل…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '.88rem', width: 200 }} />
        </div>
        <span style={{ marginInlineStart: 'auto' }} />
        <button className="btn-ghost" onClick={exportCSV}><Download size={15} /> تصدير CSV</button>
        <button className="btn-solid" onClick={bulkFollowUp}><Mail size={15} /> إرسال متابعة جماعية</button>
      </div>

      <div className="panel">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>المعرف</th><th>الاسم</th><th>الهاتف</th><th>ترك في المرحلة</th><th>قيمة محتملة</th><th>الحالة</th><th>التاريخ</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 800 }}>{l.id}</td>
                  <td><b>{l.name}</b></td>
                  <td className="num" style={{ fontSize: '.84rem' }}>{l.phone}</td>
                  <td style={{ fontSize: '.84rem' }}>{l.stage}</td>
                  <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 800, color: l.value ? 'var(--coral)' : 'var(--ink-soft)' }}>{l.value ? `${l.value} ج.م` : '—'}</td>
                  <td><span className={`badge ${statusMap[l.status]}`}>{l.status}</span></td>
                  <td className="num" style={{ fontSize: '.8rem', color: 'var(--ink-soft)' }}>{l.date}</td>
                  <td>
                    <button className="btn-ghost" style={{ padding: '.35rem .7rem', fontSize: '.78rem' }} onClick={() => contactLead(l)}>
                      <Phone size={13} /> تواصل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



