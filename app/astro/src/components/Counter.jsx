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
            {/* TOP HALF: Date + Chip (uses rhythm-based spacing) */}
            <div className="top-half">
                <div className="date-banner" aria-label={dateStr}>
                    <span className="date-text">{dateStr}</span>
                </div>
                <div className="chip-name" aria-label="Chip">Chip</div>
            </div>

            {/* Mid divider at exact half */}
            <div className="mid-divider" role="presentation" />

            {/* BOTTOM HALF: Counter */}
            <div className="bottom-half">
                <div className="counter-title" aria-hidden="true">COUNTER</div>
                <div className="counter-value" aria-live="polite">{value}</div>
                <div className="counter-buttons">
                    <button className="button tactile raised" onClick={() => set(v => v + 1)}>+1</button>
                    <button className="button tactile raised" onClick={() => set(v => v + 5)}>+5</button>
                    <button className="button tactile raised secondary" onClick={() => set(initial)}>Reset</button>
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

        /* Proportional spacing scale (matches page) */
        .counter-col{
          --rhythm: 12px;
          width: 100%;
          max-width: var(--colWidth);
          display: grid;
          grid-template-rows: 1fr 2px 1fr;   /* equal halves + divider */
          gap: 0;
        }

        /* ---------- TOP HALF (Date + Chip) ---------- */
        .top-half{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:flex-start;
          padding-top: var(--rhythm);      /* aligns with Analog heading top margin */
          gap: calc(var(--rhythm) * 0.75);
        }
        .date-banner{
          width: 100%;
          padding: calc(var(--rhythm) * 0.45) calc(var(--rhythm) * 0.75);
          border: 1.5px solid rgba(255,255,255,.9);
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
          box-shadow:
            inset 0 0 0 1px rgba(0,0,0,.18),
            0 8px 18px rgba(0,0,0,.18);
        }
        .date-text{
          display:block;
          font-weight:700;
          color:#fff;
          letter-spacing:.05em;
          text-transform:uppercase;
          font-size: clamp(0.9rem, 2.2vw, 1.05rem);
          text-align:center;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .chip-name{
          font-family: 'Pacifico', cursive;
          font-size: clamp(1.6rem, 3.3vw, 2.2rem);
          line-height: 1.1;
          letter-spacing: .02em;
          background: linear-gradient(90deg, #ffffff, #dbeafe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 10px rgba(0,0,0,.25);
          margin: 0;  /* precise spacing driven by grid gaps */
        }

        /* ---------- MID DIVIDER ---------- */
        .mid-divider{
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,.35);
          border-radius: 2px;
        }

        /* ---------- BOTTOM HALF (Counter) ---------- */
        .bottom-half{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap: calc(var(--rhythm) * 0.9);
          padding: calc(var(--rhythm) * 1) 0;
        }
        .counter-title{
          width: 100%;
          text-align:center;
          font-weight: 800;
          color:#fff;
          text-transform: uppercase;
          letter-spacing: .35em;
          word-spacing: .4em;
          opacity: .95;
          font-size: .95rem;
          margin: 0;
        }
        .counter-value{
          width: 100%;
          font-size: clamp(2.4rem, 6vw, 3.6rem);
          line-height: 1.1;
          font-weight: 800;
          color: #fff;
          padding: calc(var(--rhythm) * 0.6) calc(var(--rhythm) * 1);
          border: 2px solid rgba(255,255,255,.95);
          border-radius: 12px;
          box-shadow:
            0 0 0 3px rgba(255,255,255,.18) inset,
            0 6px 18px rgba(0,0,0,.18);
          text-align:center;
        }

        .counter-buttons{
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: calc(var(--rhythm) * 0.75);
          align-items: center;
          justify-items: center;
        }
        .counter-buttons .button{
          width: 100%;
          max-width: 7rem;
        }
      `}</style>
        </div>
    );
}
