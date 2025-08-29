import { useEffect, useState } from "react";

export default function Counter({ initial = 0 }) {
    const [value, set] = useState(initial);
    const [now, setNow] = useState(new Date());

    // Keep the date fresh
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
            {/* -------- TOP HALF: Date (pinned top) + Chip (fills remaining, centered) -------- */}
            <div className="top-half">
                <div className="date-banner" aria-label={dateStr}>
                    <span className="date-text">{dateStr}</span>
                </div>

                {/* Chip sits in a box that consumes the rest of the top-half and centers it */}
                <div className="chip-box">
                    <div className="chip-name" aria-label="Chip">Chip</div>
                </div>
            </div>

            {/* Midpoint divider */}
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

        /* Column uses equal halves with a thin divider row in the middle */
        .counter-col{
          --rhythm: 12px;
          width: 100%;
          max-width: var(--colWidth);
          display: grid;
          grid-template-rows: 1fr 2px 1fr; /* top half | divider | bottom half */
        }

        /* ---------- TOP HALF ---------- */
        .top-half{
          /* 2-row grid: date = auto top; chip-box = takes the rest */
          display: grid;
          grid-template-rows: auto 1fr;
          gap: calc(var(--rhythm) * 0.9);
          /* aligns the date to the same "line" as the analog heading */
          padding-top: var(--rhythm);
        }

        /* Date pinned to the very top of the top-half */
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
          text-transform:uppercase;
          font-size: clamp(0.95rem, 2.3vw, 1.1rem);
          text-align:center;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        /* Chip-box fills remaining vertical space of the top-half and centers Chip */
        .chip-box{
          min-height: 0; /* allow it to shrink if needed */
          display:flex;
          align-items:center;   /* vertical center */
          justify-content:center; /* horizontal center */
        }

        /* Big, stylish, and NEVER clipped */
        .chip-name{
          position: relative;
          font-family: 'Pacifico', cursive;
          font-size: clamp(3rem, 6.6vw, 4.2rem);  /* larger */
          line-height: 1.3;                      /* room for descenders */
          padding-bottom: 6px;                   /* extra clearance for the "p" tail */
          overflow: visible;
          letter-spacing: .01em;
          background: linear-gradient(90deg, #ffffff, #dbeafe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow:
            0 2px 10px rgba(0,0,0,.25),
            0 0 1px rgba(255,255,255,.35);
        }
        .chip-name::after{
          content:"";
          position:absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -10px;              /* keep underline below descender */
          width: 62%;
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
          box-shadow: 0 4px 14px rgba(0,0,0,.2);
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
          gap: calc(var(--rhythm) * 1);
          padding: calc(var(--rhythm) * 1) 0;
        }
        .counter-title{
          font-weight: 800;
          color:#fff;
          text-transform: uppercase;
          letter-spacing: .35em;
          font-size: .95rem;
        }
        .counter-value{
          width: 100%;
          font-size: clamp(2.6rem, 6.2vw, 4rem);
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
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: calc(var(--rhythm) * 0.75);
          width: 100%;
        }
        .counter-buttons .button{
          width: 100%;
          max-width: 7rem;
        }
      `}</style>
        </div>
    );
}
