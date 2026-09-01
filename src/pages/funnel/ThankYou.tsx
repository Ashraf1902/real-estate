import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Check, Mail, Send, MessagesSquare, KeyRound, Download, FileText, Bell, MapPin } from 'lucide-react';
import { properties } from '../../data/mock';
import { getDraft, clearDraft } from '../../funnelState';
import { createBooking, createLead, fetchPropertyById } from '../../api';

export default function ThankYou() {
  const st = (useLocation().state as Record<string, any>) || {};
  const mockProp = properties.find((p) => p.id === st.propertyId) ?? properties[0];
  const [prop, setProp] = useState(mockProp);
  const fmt = (n: number) => n.toLocaleString('ar-EG');
  const label = st.upsell ? 'تمت إضافة باقة التسليم المتكامل' : st.downsell ? 'تمت إضافة عقد الصيانة' : 'تم تأكيد حجز وحدتك';
  const [bookingId, setBookingId] = useState<string | null>(null);
  const sent = useRef(false);

  useEffect(() => {
    fetchPropertyById(st.propertyId ?? mockProp.id, mockProp).then(setProp).catch(() => {});
  }, [st.propertyId]);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const d = getDraft();
    const cust = d.customer ?? { name: 'زائر', phone: '' };
    const serviceNames: string[] = [
      ...(d.serviceNames ?? []),
      ...(d.upsell ? ['باقة تسليم متكامل'] : []),
      ...(d.downsell ? ['عقد صيانة سنوي'] : []),
    ];
    const serviceStr = serviceNames.length ? serviceNames.join('، ') : 'بدون خدمات';
    const propertyTitle = d.propertyTitle ?? prop.title;
    const servi = serviceNames.length > 0;

    createBooking({
      customer: cust.name,
      phone: cust.phone,
      property: propertyTitle,
      service: serviceStr,
      downPayment: 0,
      status: 'قيد المراجعة',
      servi,
    }).then((row) => { if (row) setBookingId(row.id); });

    createLead({
      name: cust.name,
      phone: cust.phone,
      interest: propertyTitle,
      stage: 'تأكيد الحجز',
      value: prop.price,
      status: 'جديد',
    });

    clearDraft();
  }, []);

  const steps = [
    { title: 'اتصل بيك فريقنا خلال 24 ساعة', text: `لترتيب زيارة ({prop.title}) ومراجعة تفاصيل العقد والمقدم.`, icon: <Mail size={18} /> },
    { title: 'استلم عقد الحجز الموقّع', text: 'هيوصل العقد لبريدك، ويتم توثيق المقدم رسمياً.', icon: <FileText size={18} /> },
    { title: 'جدول التسلّم والمفاتيح', text: 'بعد استكمال المتبقي، هتستلم المفاتيح في موعد محدد على الأرض.', icon: <KeyRound size={18} /> },
  ];

  return (
    <section className="ty-sec">
      <div className="wrap">
        <div className="ty-card">
          <div className="ty-head">
            <div className="ty-check"><Check size={48} strokeWidth={3} /></div>
            <h2>مبروك! {label} 🎉</h2>
            <p className="num">رقم الحجز: {bookingId ?? '#BK-....'} · {prop.title}</p>
          </div>
          <div className="ty-body">
            <div className="ty-title"><MapPin size={24} /> خطوات استلام وحدتك</div>
            <ol className="ty-list">
              {steps.map((s, i) => (
                <li key={i} className="ty-step">
                  <span className="n num">{i + 1}</span>
                  <div><b>{s.title}</b><p>{s.text}</p></div>
                  <span style={{ color: 'var(--emerald)', marginInlineStart: 'auto' }}>{s.icon}</span>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: '1rem', background: '#FFFBF2', border: '1px dashed var(--gold)', borderRadius: 12, padding: '.8rem 1.1rem', fontSize: '.88rem', fontWeight: 700 }}>
              ✓ <b className="num">{st.total ? fmt(st.total) : ''}</b> {st.total ? 'خدمات أُضيفت لحجزك' : 'حجزك تم بالبيانات'}{' '}
              — <b style={{ color: 'var(--emerald)' }}>من غير أي دفع.</b> المقدم والتقسيط هيتفقوا معاك مع فريق المبيعات عند التواصل.
            </div>
            <div className="ty-groups">
              <a href="#" className="ty-group tg1"><Send size={20} /> تواصل واتساب مع فريق المبيعات</a>
              <a href="#" className="ty-group tg2"><MessagesSquare size={20} /> انضم لمجموعة ملاك الوحدات</a>
            </div>
            <div className="ty-note">
              <Bell size={15} style={{ display: 'inline', verticalAlign: '-3px', color: 'var(--gold)' }} />{' '}
              متابعة كل تفاصيل العقود والاستلام هتوصلك على واتساب + البريد.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
