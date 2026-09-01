import { useEffect, useState } from 'react';

export function useCountdown(targetMinutes: number) {
  const [end] = useState(() => Date.now() + targetMinutes * 60 * 1000);
  const [left, setLeft] = useState(end - Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(Math.max(0, end - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [end]);

  const total = Math.floor(left / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}

export function TimeBox({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, '0');
  return (
    <div className="cbox num">
      <span className="cbox-num">{v}</span>
      <span className="cbox-label">{label}</span>
    </div>
  );
}
