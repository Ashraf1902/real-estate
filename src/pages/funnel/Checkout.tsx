import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock, ShieldCheck, MapPin, Clock, Check,
  PhoneCall, FileText, KeyRound, UserPlus,
} from 'lucide-react';
import { properties, services, agency } from '../../data/mock';
import { fetchPropertyById } from '../../api';
import { FunnelChrome } from '../../components/FunnelChrome';
import { useCountdown } from '../../components/Countdown';
import { setDraft } from '../../funnelState';

const servIcon: Record<string, React.ReactNode> = {
  'تشطيب': '🛠️',
  'أثاث': '🛋️',
  'صيانة': '🔧',
  'استشارة': '🤝',
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId } = (location.state as { propertyId?: string }) || {};
  const mockProp = properties.find((p) => p.id === propertyId) ?? properties[0];
  const [prop, setProp] = useState(mockProp);
  const fmt = (n: number) => n.toLocaleString('ar-EG');

  useEffect(() => {
    fetchPropertyById(propertyId ?? mockProp.id, mockProp).then(setProp).catch(() => {});
  }, [propertyId]);

  const { m, s } = useCountdown(22);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDraft({
      propertyId: prop.id,
      propertyTitle: prop.title,
      customer: form,
      services: selected,
      serviceNames: selected.map((id) => services.find((s) => s.id === id)?.name).filter(Boolean) as string[],
    });
    // no payment — just book with data
    navigate('/upsell', { state: { propertyId: prop.id, selected, customer: form } });
  };

  const nextSteps = [
    { icon: <PhoneCall size={16} />, t: 'فريق المبيعات هيتواصل معاك خلال 24 ساعة', d: `للتأكيد وترتيب زيارة ({prop.location}).` },
    { icon: <FileText size={16} />, t: 'وبناك عقد الحجز والدفع', d: 'بعد ما تتفقوا على المقدم والتقسيط، بيتوثق العقار باسمك.' },
    { icon: <KeyRound size={16} />, t: 'استلم المفاتيح', d: 'بعد استكمال الإجراءات، بنسلّمك وحدتك رسميًا.' },
  ];

  return (
    <>
      <FunnelChrome />
      <div className="wrap">
        <div className="usteps num">
          <span className="ustep on"><span className="dot">1</span> بيانات الحجز <span className="sep">←</span></span>
          <span className="ustep"><span className="dot">2</span> الخدمات <span className="sep">←</span></span>
          <span className="ustep"><span className="dot">3</span> تأكيد الحجز</span>
        </div>

        <form className="ck-wrap" onSubmit={submit}>
          {/* FORM */}
          <section className="ck-card">
            <h2 style={{ color: 'var(--navy)' }}><UserPlus size={24} /> احجز وحدتك — بدون دفع</h2>
            <p className="ck-sub">
              املأ بيانات الحجز واحجز الوحدة <b>ببلاش ومن غير أي فلوس</b>. فريقنا هيتواصل معاك لتأكيد المقدم وترتيب زيارة الوحدة.{" "}
              <b className="num" style={{ color: 'var(--coral)' }}>الوحدات المتاحة في {prop.title}: {prop.available} فقط!</b>
            </p>

            {/* Selected property summary */}
            <div className="sum-item" style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '.8rem 1rem', marginBottom: '1.2rem', background: '#F6FAFB' }}>
              <div>
                <b>{prop.title}</b>
                <div style={{ fontSize: '.82rem', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: '.3rem', marginTop: '.2rem' }}>
                  <MapPin size={13} /> {prop.location}
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div className="num" style={{ fontWeight: 900 }}>{fmt(prop.price)} ج.م</div>
                {prop.installment && <div className="num" style={{ fontSize: '.78rem', color: 'var(--emerald)' }}>مقدم {prop.installment.down} · تقسيط {fmt(prop.installment.monthly)} ج.م/شهر</div>}
              </div>
            </div>

            <div className="fgroup">
              <label>الاسم بالكامل <span className="req">*</span></label>
              <input className="field" placeholder="مثال: محمد أحمد السيد" value={form.name} onChange={set('name')} required />
            </div>
            <div className="fgroup">
              <label>رقم الهاتف (واتساب) <span className="req">*</span></label>
              <input className="field" dir="ltr" placeholder="01xxxxxxxxx" value={form.phone} onChange={set('phone')} required />
            </div>
            <div className="fgroup">
              <label>البريد الإلكتروني (اختياري)</label>
              <input className="field" dir="ltr" placeholder="you@email.com" value={form.email} onChange={set('email')} />
            </div>

            {/* SERVICE BUMPS (free booking — add services to your booking) */}
            <div style={{ margin: '1.2rem 0 .6rem' }}>
              <b style={{ fontFamily: 'var(--f-display)', fontWeight: 800 }}>
                <span style={{ color: 'var(--gold)' }}>＋</span> أضف خدمات لاستلام وحدتك جاهزة (اختياري)
              </b>
              <p style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: '.2rem' }}>اختر خدمات تضاف لحجزك — تُفعَّل بجدول تسليم موحّد مع وحدتك.</p>
            </div>
            {services.map((sv) => (
              <label className="bump" key={sv.id} style={{ margin: '.6rem 0' }}>
                <input type="checkbox" checked={selected.includes(sv.id)} onChange={() => toggle(sv.id)} />
                <span className="bump-img" style={{ background: 'linear-gradient(135deg,#c9dde2,#9cc1c9)' }}>{servIcon[sv.kind]}</span>
                <span>
                  <b>{sv.name}</b>
                  <span className="num">{sv.desc}</span>
                </span>
                <span className="bp num">+ {fmt(sv.price)} ج.م</span>
              </label>
            ))}

            <button className="ck-btn" type="submit" style={{ background: 'linear-gradient(135deg,var(--navy-2),#115E6B)', boxShadow: '0 7px 0 #082e38' }}>
              <Lock size={20} /> احجز هذه الوحدة — بدون دفع
            </button>
            <p className="ck-note"><ShieldCheck size={15} /> ما فيش أي رسوم للحجز · المقدم والدفع بيتأكدوا لاحقًا مع فريق المبيعات · بياناتك مش بتتشارك</p>
          </section>

          {/* SUMMARY */}
          <aside className="ck-card sum-card">
            <h2 style={{ fontSize: '1.25rem' }}>ملخص الحجز</h2>
            <div className="sum-item"><b>{prop.title}</b><span className="pr num">{fmt(prop.price)} ج.م</span></div>
            {prop.installment && (
              <div className="sum-item">
                <b>المقدم والحجز</b>
                <span className="pr num">مقدم {prop.installment.down} · {fmt(prop.installment.monthly)} ج.م/شهر × {prop.installment.years} سنين</span>
              </div>
            )}
            <div className="sum-item">
              <b>الخدمات المطلوبة ({selected.length})</b>
              <span className={selected.length ? 'pr num' : 'free num'}>{selected.length ? selected.map((id) => services.find((s) => s.id === id)?.name).join('، ') : 'بدون خدمات'}</span>
            </div>
            <div className="sum-note" style={{ margin: '1rem 0', background: 'var(--emerald-bg)', border: '1px dashed var(--emerald)', borderRadius: 12, padding: '.8rem 1rem', fontSize: '.85rem', fontWeight: 700, color: 'var(--navy-2)' }}>
              <Lock size={15} style={{ color: 'var(--emerald)', verticalAlign: '-3px' }} />{' '}
              الحجز ده <b>بالبيانات فقط ومن غير دفع</b> — الدفع هيتم لاحقًا عند تأكيد فريق المبيعات معاك.
            </div>
            <div className="ty-title" style={{ marginBottom: '.7rem' }}>الخطوات اللي جاية</div>
            <ol className="ty-list">
              {nextSteps.map((st, i) => (
                <li key={i} className="ty-step">
                  <span className="n num">{i + 1}</span>
                  <div><b>{st.t}</b><p>{st.d}</p></div>
                  <span style={{ color: 'var(--emerald)', marginInlineStart: 'auto' }}>{st.icon}</span>
                </li>
              ))}
            </ol>
          </aside>
        </form>
        <div className="fadv num" style={{ display: 'flex', justifyContent: 'center', gap: '.4rem' }}>
          <Clock size={18} style={{ color: 'var(--gold-2)' }} /> وحدة {prop.title} متبقية {prop.available} — الحجز بيُجمّد وحدتك · متبقي <b style={{ color: 'var(--gold-2)' }}>{m}:{String(s).padStart(2, '0')}</b>
        </div>
      </div>
    </>
  );
}
