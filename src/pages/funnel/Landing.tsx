import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, BedDouble, Bath, Ruler, ShieldCheck, Check, Zap, Search,
  Building2, KeyRound, Handshake, TrendingUp, ChevronLeft, Flag,
} from 'lucide-react';
import { agency, properties as mockProperties } from '../../data/mock';
import type { Property } from '../../data/mock';
import { fetchProperties } from '../../api';
import { FunnelChrome } from '../../components/FunnelChrome';
import { SocialLinks } from '../../components/SocialLinks';

function Reveal({ children, d = 0 }: { children: React.ReactNode; d?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add('in-view'); io.unobserve(el); } }),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className="reveal" style={{ ['--d' as string]: `${d}s` }}>{children}</div>;
}

const typeIcon: Record<string, React.ReactNode> = {
  'شقة': <Building2 size={14} />,
  'فيلا': <HomeIcon />,
  'أرض': <Flag size={14} />,
  'مكتب': <Building2 size={14} />,
};
function HomeIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 10l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>; }

const tagClass: Record<string, string> = { 'مميز': 't-mm', 'جديد': 't-new', 'استثماري': 't-inv', 'خصم': 't-disc' };

function PropertyCard({ p }: { p: Property }) {
  const navigate = useNavigate();
  const fmt = (n: number) => n.toLocaleString('ar-EG');
  const [imgErr, setImgErr] = useState(false);
  const [imgTime, setImgTime] = useState(false);
  useEffect(() => {
    if (!p.image || imgErr) return;
    const t = setTimeout(() => setImgTime(true), 6000);
    return () => clearTimeout(t);
  }, [p.image, imgErr]);
  const showImg = p.image && !imgErr && !imgTime;
  return (
    <article className="pcard">
      <div className="pimg">
        {showImg
          ? <img src={p.image} alt={p.title} loading="lazy" onError={() => setImgErr(true)} onLoad={() => setImgTime(false)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span className="emoji">{p.images?.[0] ?? '🏠'}</span>}
        {p.tag && <span className={`ptag ${tagClass[p.tag]}`}>{p.tag}</span>}
        <span className="pnum num">{fmt(p.price)} ج.م</span>
      </div>
      <div className="pbody">
        <h3>{p.title}</h3>
        <div className="ploc"><MapPin size={14} /> {p.location}</div>
        <div className="pmeta">
          {p.beds > 0 && <span className="pm"><BedDouble /> {p.beds} غرف</span>}
          {p.baths > 0 && <span className="pm"><Bath /> {p.baths} حمام</span>}
          <span className="pm"><Ruler /> {p.area} م²</span>
        </div>
        <div className="pprice num">{fmt(p.price)} <small>ج.م</small></div>
        {p.installment && (
          <div className="pinst num">مقدم {p.installment.down} · <b>{fmt(p.installment.monthly)} ج.م/شهر</b> · {p.installment.years} سنين</div>
        )}
        <div className="pactions">
          <button className="pbook" onClick={() => navigate('/checkout', { state: { propertyId: p.id } })}>
            احجز الوحدة <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: '-3px' }} />
          </button>
          <button className="pdetail" onClick={() => navigate('/checkout', { state: { propertyId: p.id } })}>تفاصيل</button>
        </div>
      </div>
    </article>
  );
}

export default function Landing() {
  const [type, setType] = useState('الكل');
  const [q, setQ] = useState('');
  const [props, setProps] = useState<Property[]>(() => [...mockProperties]);
  const fmt = (n: number) => n.toLocaleString('ar-EG');
  const types = ['الكل', 'شقة', 'فيلا', 'بنتهاوس', 'شاليه', 'أرض', 'مكتب'];

  useEffect(() => {
    fetchProperties(mockProperties).then((ps) => setProps(ps.length ? ps : mockProperties)).catch(() => {});
  }, []);

  const filtered = props.filter((p) => {
    const okType = type === 'الكل' || p.type === type;
    const okQ = !q || p.title.includes(q) || p.location.includes(q);
    return okType && okQ;
  });

  return (
    <>
      <FunnelChrome />
      <main>
        {/* HERO */}
        <section className="land-hero prop-hero">
          <div className="wrap hero-inner">
            <Reveal>
              <span className="hero-badge"><Check size={14} /> وحدات معتمدة بأسعار مباشرة من المطوّر</span>
              <h1>اشتري أو استثمر في عقارك <span className="hl">بأمان وشفافية</span></h1>
              <p className="hero-sub">
                {agency.slogan}. شقق، فيلات، وأراضي مختارة بعناية — أسعار حقيقية، تقسيط مرن، ودفع آمن. كاش أو مقدم يبدأ من {fmt(1850000)} ج.م.
              </p>
              <div className="hero-cta">
                <a href="#listings" className="cta-big" style={{ margin: 0, maxWidth: '100%', display: 'inline-flex' }}>
                  استعرض العقارات المتاحة <ChevronLeft size={22} style={{ marginInlineStart: '.4rem' }} />
                </a>
                <a href="#trust" className="cta-big" style={{ margin: 0, maxWidth: '100%', display: 'inline-flex', background: 'transparent', boxShadow: 'none', border: '1.5px solid rgba(255,107,107,.5)', color: '#FF6B6B' }}>
                  ليه تثق بينا؟
                </a>
              </div>
              <div className="hero-stats">
                <div className="hstat"><div className="hv num">{fmt(120)}<span style={{ fontSize: '1.2rem' }}>+</span></div><div className="hl">عقار متوفر</div></div>
                <div className="hstat"><div className="hv num">{fmt(2400)}</div><div className="hl">عميل اشترى</div></div>
                <div className="hstat"><div className="hv num">15</div><div className="hl">سنة خبرة</div></div>
              </div>
            </Reveal>
            <Reveal d={0.15}>
              <div className="solcard" style={{ background: 'linear-gradient(180deg,#8E1226,#4A0C17)', color: '#fff', border: '1px solid rgba(255,255,255,.15)' }}>
                <div className="solcard-head" style={{ background: 'rgba(0,0,0,.2)' }}><KeyRound size={26} /><h4 style={{ color: '#fff' }}>لماذا تختار {agency.brand}؟</h4></div>
                <div className="sol-list" style={{ padding: '1.2rem 1.4rem' }}>
                  {[
                    'كل العقارات فحصت قانونيًّا وسجلناها قبل العرض.',
                    'الأسعار معلنة وشفافة — بدون مفاجآت أو رسوم خفية.',
                    'عقد موثق وتسليم آمن حتى استلام مفاتيحك.',
                    'فريق متخصص بيجاوبك ويرشدك في كل خطوة.',
                  ].map((x) => (
                    <div className="sol-row" style={{ color: '#FFE9EC' }} key={x}>
                      <span className="ck" style={{ color: 'var(--gold-2)' }}><Check size={18} /></span>
                      <span>{x}</span>
                    </div>
                  ))}
                  <div className="sol-row" style={{ marginTop: '.5rem', fontFamily: 'var(--f-display)', fontWeight: 900, color: 'var(--gold-2)' }}>
                    <Handshake size={18} /> ضمان حقك لحظة تسليم الوحدة
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="fsection" style={{ padding: '40px 0' }} id="trust">
          <div className="wrap">
            <div className="trustrow" style={{ gap: '2.5rem' }}>
              <span className="trust"><ShieldCheck size={20} /> عقد موثق وتسليم آمن</span>
              <span className="trust"><KeyRound size={20} /> ملكية نظيفة ومفحوصة</span>
              <span className="trust"><Zap size={20} /> تقسيط مرن حتى 8 سنين</span>
              <span className="trust"><TrendingUp size={20} /> وحدات استثمارية بعائد مجرّب</span>
            </div>
          </div>
        </section>

        {/* LISTINGS */}
        <section className="fsection" id="listings" style={{ background: '#FFF3F5', borderTop: '1px solid var(--line)' }}>
          <div className="wrap">
            <Reveal>
              <div className="fsec-head">
                <span className="eyebrow">وحدات متاحة الآن</span>
                <h2>اختار عقارك من <span className="hl">معرضنا الحالي</span></h2>
                <p className="sub">فلتر حسب النوع وابحث بالأسم أو الموقع. كل وحداتنا جاهزة للحجز الفوري.</p>
              </div>
            </Reveal>

            <Reveal d={0.05}>
              <div className="filters">
                <Search size={16} color="var(--ink-soft)" />
                <input className="search" placeholder="ابحث بعنوان العقار أو المنطقة…" value={q} onChange={(e) => setQ(e.target.value)} />
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {types.map((t) => <option key={t} value={t}>{t === 'الكل' ? 'كل الأنواع' : t}</option>)}
                </select>
                <span className="fcount num">{filtered.length} عقار</span>
              </div>
            </Reveal>

            <div className="prop-grid">
              {filtered.map((p, i) => <Reveal key={p.id} d={(i % 3) * 0.08}><PropertyCard p={p} /></Reveal>)}
              {filtered.length === 0 && (
                <div className="pempty" style={{ gridColumn: '1/-1' }}>مفيش عقارات مطابقة — جرّب تغيّر الفلتر.</div>
              )}
            </div>

            <div style={{ marginTop: '2rem' }} className="inv-cta">
              <div><h3>عندك عقار وتبيعه أو مستثمر محترف؟</h3><p>قناتنا الاستثمارية بتوفّر وحدات وعروض حصرية للأعضاء.</p></div>
              <Link to="/checkout" className="pbook"><TrendingUp size={18} style={{ display: 'inline', verticalAlign: '-3px' }} /> تابع العروض الاستثمارية</Link>
            </div>
          </div>
        </section>

        <footer className="social-foot">
          <div className="wrap social-wrap">
            <div>
              <div className="social-label">تابعنا على السوشيال ميديا</div>
              <div className="social-sub">وحدات وعروض حصرية أول بأول</div>
            </div>
            <SocialLinks />
          </div>
        </footer>
      </main>
    </>
  );
}
