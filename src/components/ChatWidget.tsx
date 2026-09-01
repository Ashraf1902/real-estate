import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { getBotReply, quickQuestions } from '../chatbot/engine';

type Msg = { from: 'bot' | 'user'; text: string };

const WELCOME: Msg = {
  from: 'bot',
  text: 'أهلاً 👋 أنا مساعد Real Estate. أسألني عن العقارات، الحجز، الأسعار، التقسيط، أو الخدمات. ليك أكتر من 20 وحدة للاختيار!',
};

const QUICK_ALIAS: Msg[] = [
  { from: 'bot', text: 'تقدر تختار من دول 👇 أو تكتب سؤالك بنفسك:' },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing, open]);

  const ask = (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: Msg = { from: 'user', text };
    setMsgs((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'bot', text: getBotReply(text) }]);
      setTyping(false);
    }, 550);
  };

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="فتح الدردشة"
      >
        {open ? <X size={24} /> : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
          </svg>
        )}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-head">
            <div className="chat-head-title">
              مساعد Real Estate
              <span className="chat-online">متاح الآن</span>
            </div>
          </div>

          <div className="chat-body">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg chat-${m.from}`}>{m.text}</div>
            ))}
            {typing && <div className="chat-msg chat-bot"><span className="chat-typing">...</span></div>}
            <div ref={endRef} />
          </div>

          <div className="chat-quick">
            {quickQuestions.map((q) => (
              <button key={q} onClick={() => ask(q)}>{q}</button>
            ))}
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => { e.preventDefault(); ask(input); }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك..."
            />
            <button type="submit" disabled={!input.trim()} aria-label="إرسال">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
