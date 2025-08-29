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
            {/* DATE banner at the very top; top margin matches .analog-head (1rem) */}
            <div className="date-banner" aria-label={dateStr}>
                <span className="date-text">{dateStr}</span>
            </div>

            {/* Stylish signature name just under the date */}
            <div className="chip-name" aria-label="Chip">Chip</div>

            {/* Divider between date/name and the counter stack */}
            <div className="counter-hr" role="presentation" />

            {/* Spaced-out title */}
            <div className="counter-title" aria-hidden="true">COUNTER</div>

            {/* Big centered number */}
            <div className="counter-value" aria-live="polite">{value}</div>

            {/* Buttons evenly spaced */}
            <div className="counter-buttons">
                <button className="button tactile raised" onClick={() => set(v => v + 1)}>+1</button>
                <button className="button tactile raised" onClick={() => set(v => v + 5)}>+5</button>
                <button className="button tactile raised secondary" onClick={() => set(initial)}>Reset</button>
            </div>

            <style>{`
        /* Load a playful script for your name */
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

        .counter-root{
          width: 100%;
          max-width: var(--colWidth);
          margin-inline: auto;
        }

        /* Align the date with Analog heading (top margin = 1rem) */
        .date-banner{
          width: 100%;
          margin: 1rem auto .4rem auto;
          padding: .45rem .9rem;
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

        /* Signature-style "Chip" */
        .chip-name{
          margin: .15rem auto .9rem auto;
          font-family: 'Pacifico', cursive;
          font-size: clamp(1.4rem, 3vw, 2rem);
          line-height: 1.1;
          letter-spacing: .02em;
          background: linear-gradient(90deg, #fff, #dbeafe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 10px rgba(0,0,0,.25);
        }

        .counter-hr{
          width: 100%;
          border-top: 2px solid rgba(255,255,255,.35);
          margin: .25rem auto 1rem auto; /* keep counter stack where it was */
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
