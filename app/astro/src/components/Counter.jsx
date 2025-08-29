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
            {/* TOP HALF: Date + Chip */}
            <div className="top-half">
                {/* DATE banner sits right at the top line under the digital */}
                <div className="date-banner" aria-label={dateStr}>
                    <span className="date-text">{dateStr}</span>
                </div>

                {/* Big, fancy name (no clipping) */}
                <div className="chip-name" aria-label="Chip">Chip</div>
            </div>

            {/* Divider at the exact middle */}
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

        /* Matches the page scale */
        .counter-col{
          --rhythm: 12px;
          width: 100%;
          max-width: var(--colWidth);
          display: grid;
          grid-template-rows: 1fr 2px 1fr; /* equal halves + divider */
          gap: 0;
        }

        /* TOP HALF ---------------------------------------------------- */
        .top-half{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:flex-start;
          /* no extra padding so the date rides high at the top */
          padding-top: 0;
          gap: calc(var(--rhythm) * 0.9);
        }
        .date-banner{
          width: 100%;
          /* pull the date up to align with the analog heading line */
          margin-top: var(--rhythm);  /* analog-head uses the same top margin */
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

        /* Fancy, large, unclipped signature */
        .chip-name{
          position: relative;
          font-family: 'Pacifico', cursive;
          font-size: clamp(2.2rem, 5vw, 3.2rem); /* bigger */
          line-height: 1.25;        /* prevent descender cut-off */
          padding-bottom: 4px;       /* extra room for the 'p' tail */
          margin-top: calc(var(--rhythm) * 0.5);
          margin-bottom: calc(var(--rhythm) * 0.5);
          overflow: visible;         /* absolutely no clipping */
          letter-spacing: .01em;
          background: linear-gradient(90deg, #ffffff, #dbeafe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow:
            0 2px 10px rgba(0,0,0,.25),
            0 0 1px rgba(255,255,255,.35);
        }
        /* subtle underline flourish */
        .chip-name::after{
          content:"";
          position:absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -6px;
          width: 52%;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(255,255,255,.0), rgba(255,255,255,.6), rgba(255,255,255,.0));
          box-shadow: 0 6px 18px rgba(0,0,0,.14);
        }

        /* MID DIVIDER ------------------------------------------------- */
        .mid-divider{
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,.35);
          border-radius: 2px;
        }

        /* BOTTOM HALF ------------------------------------------------- */
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
          font-size: clamp(2.6rem, 6.2vw, 3.8rem);
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
