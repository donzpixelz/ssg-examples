import { useEffect, useState } from "react";

export default function Counter({ initial = 0 }) {
    const [value, set] = useState(initial);
    const [now, setNow] = useState(new Date());

    // Update date every minute
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60 * 1000);
        return () => clearInterval(id);
    }, []);

    const dateStr = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    }).format(now);

    return (
        <div className="counter-root" style={{ textAlign: "center" }}>
            {/* DATE banner (top aligned with Analog heading via matching top margin) */}
            <div className="date-banner" aria-label={dateStr}>
                <span className="date-text">{dateStr}</span>
            </div>

            {/* NEW horizontal divider between date and counter area */}
            <div className="counter-hr" role="presentation" />

            {/* Spaced-out title across the same width */}
            <div className="counter-title" aria-hidden="true">COUNTER</div>

            {/* Big centered number */}
            <div className="counter-value" aria-live="polite">{value}</div>

            {/* Buttons evenly spaced under the value */}
            <div className="counter-buttons">
                <button className="button tactile raised" onClick={() => set(v => v + 1)}>+1</button>
                <button className="button tactile raised" onClick={() => set(v => v + 5)}>+5</button>
                <button className="button tactile raised secondary" onClick={() => set(initial)}>Reset</button>
            </div>

            <style>{`
        /* Inherit shared width from page: var(--colWidth) */
        .counter-root{
          width: 100%;
          max-width: var(--colWidth);
          margin-inline: auto;
        }

        /* Match the analog heading's top margin so tops align */
        .date-banner{
          width: 100%;
          margin: 1rem auto 0.95rem auto;  /* top = 1rem to match .analog-head top */
          padding: .4rem .9rem;
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
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        /* Thin horizontal divider between date and counter */
        .counter-hr{
          width: 100%;
          height: 0;
          border-top: 2px solid rgba(255,255,255,.35);
          margin: .75rem auto 1rem auto; /* more space below date before counter */
        }

        .counter-title{
          width: 100%;
          margin: 0 0 .45rem 0;
          font-weight: 800;
          color:#fff;
          text-transform: uppercase;
          letter-spacing: .35em;
          word-spacing: .4em;
          opacity: .95;
          font-size: .95rem;
        }

        .counter-value{
          width: 100%;
          font-size: clamp(2.4rem, 6vw, 3.6rem);
          line-height: 1.1;
          font-weight: 800;
          color: #fff;
          padding: .55rem 1.2rem;
          border: 2px solid rgba(255,255,255,.95);
          border-radius: 12px;
          box-shadow:
            0 0 0 3px rgba(255,255,255,.18) inset,
            0 6px 18px rgba(0,0,0,.18);
          margin: 0 auto .8rem auto;
          min-width: 5.5ch;
        }

        .counter-buttons{
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: .75rem;
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
