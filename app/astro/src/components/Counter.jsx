import { useEffect, useState } from "react";

export default function Counter({ initial = 0 }) {
    const [value, set] = useState(initial);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60 * 1000);
        return () => clearInterval(id);
    }, []);

    const dateStr = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(now);

    return (
        <div className="counter-col">
            {/* -------- TOP HALF: Date pinned top; Chip fills remaining & is centered -------- */}
            <div className="top-half">
                <div className="date-banner" aria-label={dateStr}>
                    <span className="date-text">{dateStr}</span>
                </div>

                <div className="chip-box">
                    <div className="chip-name" aria-label="Chip">Chip</div>
                </div>
            </div>

            {/* Mid divider */}
            <div className="mid-divider" role="presentation" />

            {/* -------- BOTTOM HALF: Counter -------- */}
            <div className="bottom-half">
                <div className="counter-title">COUNTER</div>
                <div className="counter-value" aria-live="polite">{value}</div>
                <div className="counter-buttons">
                    <button className="button tactile raised" onClick={() => set(v => v + 1)}>+1</button>
                    <button className="button tactile raised" onClick={() => set(v => v + 5)}>+5</button>
                    <button className="button tactile raised secondary" onClick={() => set(initial)}>Reset</button>
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

        .counter-col{
          --rhythm: 12px;
          width: 100%;
          max-width: var(--colWidth);
          display: grid;
          grid-template-rows: 1fr 2px 1fr;
        }

        /* TOP HALF: date (auto) + chip (1fr) */
        .top-half{
          display: grid;
          grid-template-rows: auto 1fr;
          gap: calc(var(--rhythm) * 0.9);
          padding-top: var(--rhythm); /* aligns to analog heading line */
        }
        .date-banner{
          width: 100%;
          padding: calc(var(--rhythm) * 0.45) calc(var(--rhythm) * 0.75);
          border: 1.5px solid rgba(255,255,255,.9);
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.18), 0 8px 18px rgba(0,0,0,.18);
        }
        .date-text{
          display:block; font-weight:700; color:#fff; text-transform:uppercase;
          font-size: clamp(0.95rem, 2.3vw, 1.1rem); text-align:center; white-space:nowrap;
        }

        .chip-box{
          display:flex; align-items:center; justify-content:center; min-height:0;
        }

        /* Slightly smaller for balance (no clipping) */
        .chip-name{
          position: relative;
          font-family: 'Pacifico', cursive;
          font-size: clamp(2.6rem, 6vw, 3.6rem);  /* ↓ a notch for overall balance */
          line-height: 1.3;
          padding-bottom: 6px;
          overflow: visible;
          letter-spacing: .01em;
          background: linear-gradient(90deg, #ffffff, #dbeafe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 10px rgba(0,0,0,.25), 0 0 1px rgba(255,255,255,.35);
        }
        .chip-name::after{
          content:"";
          position:absolute; left:50%; transform:translateX(-50%);
          bottom:-10px; width:58%; height:4px; border-radius:999px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
          box-shadow: 0 4px 14px rgba(0,0,0,.2);
        }

        .mid-divider{ width:100%; height:2px; background:rgba(255,255,255,.35); border-radius:2px; }

        .bottom-half{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap: calc(var(--rhythm) * 1); padding: calc(var(--rhythm) * 1) 0;
        }
        .counter-title{
          font-weight: 800; color:#fff; text-transform: uppercase; letter-spacing:.35em; font-size:.95rem;
        }
        .counter-value{
          width:100%; font-size:clamp(2.4rem, 6vw, 3.8rem); font-weight:800; color:#fff;
          padding: calc(var(--rhythm) * 0.6) calc(var(--rhythm) * 1);
          border:2px solid rgba(255,255,255,.95); border-radius:12px;
          box-shadow: inset 0 0 0 3px rgba(255,255,255,.18), 0 6px 18px rgba(0,0,0,.18);
          text-align:center;
        }
        .counter-buttons{
          width:100%; display:grid; grid-template-columns:repeat(3,1fr);
          gap: calc(var(--rhythm) * 0.75);
        }
        .counter-buttons .button{ width:100%; max-width:7rem; }
      `}</style>
        </div>
    );
}
