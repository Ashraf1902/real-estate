import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, PencilRuler, Armchair, Wrench, Sparkles, KeyRound, Lock } from 'lucide-react';
import { properties, services } from '../../data/mock';
import { fetchPropertyById } from '../../api';
import { FunnelChrome } from '../../components/FunnelChrome';
import { setDraft } from '../../funnelState';

export default function Upsell() {
  const navigate = useNavigate();
  const location = useLocation();
  const st = (location.state as Record<string, any>) || {};
  const mockProp = properties.find((p) => p.id === st.propertyId) ?? properties[0];
  const [prop, setProp] = useState(mockProp);
  const fmt = (n: number) => n.toLocaleString('ar-EG');
  const bundle = services.filter((s) => ['S-1', 'S-2', 'S-3'].includes(s.id)).reduce((s, x) => s + x.price, 0);

  useEffect(() => {
    fetchPropertyById(st.propertyId ?? mockProp.id, mockProp).then(setProp).catch(() => {});
  }, [st.propertyId]);

  const feats = [
    { icon: <PencilRuler size={18} />, text: `تشطيب سوبر لوكس كامل (${fmt(425000)} ج.م)` },
    { icon: <Armchair size={18} />, text: `فرشة مفروشة مودرن شاملة (${fmt(210000)} ج.م)` },
    { icon: <Wrench size={18} />, text: `عقد صيانة سنوي شامل (${fmt(24000)} ج.م)` },
    { icon: <KeyRound size={18} />, text: 'مفاتيح جاهزة للاستلام فور تسليم الوحدة' },
  ];

  return (
    <>
      <FunnelChrome />
      <section className="oto-sec">
        <div className="wrap">
          <div className="oto-card">
            <div className="oto-head">
              <span className="price-tag num">عرض تسليم متكامل</span>
              <h2>استلم وحدتك في {prop.title} <span className="gold">جاهزة بالكامل</span></h2>
              <p>تشطيب + أثاث + صيانة في باقة واحدة — أضفها لحجزك الآن</p>
            </div>
            <div className="oto-body">
              <div className="oto-toast"><Sparkles size={20} /> بيانات حجزك محفوظة — أضف الباقة بضغطة واحدة وبالموافقة على إضافتها لحجزك</div>
              <ul className="oto-feat">
                {feats.map((f, i) => <li key={i}>{f.icon}<span>{f.text}</span></li>)}
              </ul>
              <div className="oto-price">
                <span className="old num">{fmt(659000)} ج.م</span>
                <span className="new num">{fmt(bundle)} ج.م</span>
                <div className="save">وفّر {fmt(34000)} ج.م · توضاف للمقدم ولإجمالي الحجز</div>
              </div>
              <button className="oto-btn" onClick={() => { setDraft({ propertyId: prop.id, propertyTitle: prop.title, customer: st.customer, upsell: true, extraTotal: bundle }); navigate('/thankyou', { state: { propertyId: prop.id, total: bundle, upsell: true, customer: st.customer } }); }}>
                <Lock size={20} /> نعم، أضف باقة التسليم المتكامل <ChevronLeft size={20} />
              </button>
              <button className="oto-btn alt" onClick={() => { setDraft({ propertyId: prop.id, propertyTitle: prop.title, customer: st.customer }); navigate('/downsell', { state: { propertyId: prop.id, customer: st.customer } }); }}>
                لا، شكرًا — خليني أشوف الباقة الأرخص ↩
              </button>
              <div className="oto-secure"><ShieldCheck size={15} /> توضاف لك حجزك بس · الدفع بيتأكد مع فريق المبيعات لاحقًا</div>
            </div>
          </div>
        </div>
      </section>
      <div className="fadv num">⏳ عرض التجميع ده لفترة الحجز الحالية بس</div>
    </>
  );
}
