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
            {/* Top half */}
            <div className="top-half">
                <div className="date-banner" aria-label={dateStr}>
                    <span className="date-text">{dateStr}</span>
                </div>
                <div className="chip-name" aria-label="Chip">Chip</div>
            </div>

            <div className="mid-divider" role="presentation" />

            {/* Bottom half */}
            <div className="bottom-half">
                <div className="counter-title">COUNTER</div>
                <div className="counter-value">{value}</div>
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

        /* TOP HALF */
        .top-half{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:flex-start;
          padding-top: 0;
          gap: calc(var(--rhythm) * 1);
        }
        .date-banner{
          width: 100%;
          margin-top: 0; /* pull to very top */
          padding: calc(var(--rhythm) * 0.4) calc(var(--rhythm) * 0.75);
          border: 1.5px solid rgba(255,255,255,.9);
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.18), 0 8px 18px rgba(0,0,0,.18);
        }
        .date-text{
          display:block;
          font-weight:700;
          color:#fff;
          text-transform:uppercase;
          font-size: clamp(0.95rem, 2.4vw, 1.1rem);
          text-align:center;
          white-space:nowrap;
        }

        /* BIG CHIP */
        .chip-name{
          position: relative;
          font-family: 'Pacifico', cursive;
          font-size: clamp(2.8rem, 6vw, 3.8rem); /* bigger */
          line-height: 1.35;      /* extra breathing room */
          margin-top: calc(var(--rhythm) * 0.75);
          margin-bottom: calc(var(--rhythm) * 0.75);
          overflow: visible;
          background: linear-gradient(90deg, #ffffff, #dbeafe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 10px rgba(0,0,0,.25), 0 0 2px rgba(255,255,255,.4);
        }
        .chip-name::after{
          content:"";
          position:absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -8px; /* lower so descender P clears */
          width: 60%;
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
          box-shadow: 0 4px 14px rgba(0,0,0,.2);
        }

        /* DIVIDER */
        .mid-divider{
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,.35);
        }

        /* BOTTOM HALF */
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
          font-size: clamp(2.6rem, 6.2vw, 4rem);
          font-weight: 800;
          color: #fff;
          padding: calc(var(--rhythm) * 0.6) calc(var(--rhythm) * 1);
          border: 2px solid rgba(255,255,255,.95);
          border-radius: 12px;
          box-shadow: inset 0 0 0 3px rgba(255,255,255,.18), 0 6px 18px rgba(0,0,0,.18);
          text-align:center;
        }
        .counter-buttons{
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: calc(var(--rhythm) * 0.75);
          width: 100%;
        }
        .counter-buttons .button{
          max-width: 7rem;
          width: 100%;
        }
      `}</style>
        </div>
    );
}
