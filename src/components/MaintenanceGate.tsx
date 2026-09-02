import { useEffect, useState } from 'react';
import { Wrench, ShieldCheck } from 'lucide-react';
import { fetchSettings } from '../api';

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState<boolean | null>(null);
  const [message, setMessage] = useState('نعود قريبًا بعد تطوير الفانل');

  useEffect(() => {
    fetchSettings().then((s) => {
      setMaintenance(!!s.maintenance);
      if (s.maintenanceMessage) setMessage(s.maintenanceMessage);
    }).catch(() => setMaintenance(false));
  }, []);

  if (maintenance === null) return null;

  if (maintenance) {
    return (
      <div className="maint-screen">
        <div className="maint-card">
          <div className="maint-ico"><Wrench size={40} /></div>
          <h1>وضع الصيانة</h1>
          <p>{message}</p>
          <div className="maint-note"><ShieldCheck size={15} /> الفانل يعود للعمل قريبًا — تابعنا أو تواصل معنا للمزيد.</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
