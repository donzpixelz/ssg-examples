import { useEffect, useState } from "react";

export default function DigitalClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const hours24 = now.getHours();
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const h = ((hours24 + 11) % 12) + 1; // 1–12
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    return (
        <div className="digital">
            <div className="display">
        <span className="time">
          {h}:{mm}:{ss}
        </span>
                <span className="ampm">{ampm}</span>
            </div>
            <style>{`
        .digital {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .display {
          background: #111;
          color: #ff5a5a;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Share Tech Mono", monospace;
          box-shadow: inset 0 0 12px rgba(0,0,0,.6);
          text-align: center;
        }
        .time {
          font-size: 2.25rem;
          letter-spacing: .05em;
          display: block;
        }
        .ampm {
          display: block;
          margin-top: .25rem;
          font-size: 1.25rem;
          color: #ffb3b3;
        }
      `}</style>
        </div>
    );
}
