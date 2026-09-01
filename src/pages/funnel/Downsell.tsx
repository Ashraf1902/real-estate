import { useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Check, ShieldCheck, KeyRound } from 'lucide-react';
import { FunnelChrome } from '../../components/FunnelChrome';
import { setDraft } from '../../funnelState';

export default function Downsell() {
  const navigate = useNavigate();
  const st = (useLocation().state as Record<string, any>) || {};

  return (
    <>
      <FunnelChrome />
      <section className="oto-sec">
        <div className="wrap pp">
          <div className="pp-card">
            <div className="pp-ico" style={{ background: 'var(--gold-2)', color: 'var(--ink)' }}><Wrench size={34} /></div>
            <h3>عقد صيانة سنوي</h3>
            <p>صيانة دورية للسباكة والكهرباء والتكييف لمدة سنة — تُضاف لحجزك وتُفعَّل عند الاستلام.</p>
            <div className="pp-price num">بدل 24,000 ← 14,900 ج.م</div>
            <button className="oto-btn" onClick={() => { setDraft({ propertyId: st.propertyId, customer: st.customer, downsell: true, extraTotal: 14900 }); navigate('/thankyou', { state: { propertyId: st.propertyId, total: 14900, downsell: true, customer: st.customer } }); }}>
              <Check size={20} /> أضف الصيانة بسعر 14,900 ج.م
            </button>
            <div className="oto-secure"><ShieldCheck size={14} /> تُضاف لحجزك · الدفع لاحقًا</div>
          </div>

          <div className="pp-card dark">
            <div className="pp-ico" style={{ background: 'rgba(255,255,255,.1)', color: 'var(--gold-2)' }}><KeyRound size={30} /></div>
            <h3>مش محتاج أي خدمة</h3>
            <p>مفيش مشكلة — حجزك تم بالبيانات ومن غير دفع، وهنوافيك بجدول الاستلام والمفاتيح.</p>
            <div className="pp-price" style={{ fontSize: '1.1rem', color: '#C7D4E0' }}>حجزك الأساسي ثابت</div>
            <button className="oto-btn alt" style={{ borderColor: 'rgba(255,255,255,.3)', color: '#fff' }} onClick={() => { setDraft({ propertyId: st.propertyId, customer: st.customer }); navigate('/thankyou', { state: { propertyId: st.propertyId, customer: st.customer } }); }}>
              لا شكرًا — أكمل حجزي الأساسي
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
