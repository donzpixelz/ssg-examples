import { useEffect, useState } from "react";

export default function DateBanner(){
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);
    const dateStr = new Intl.DateTimeFormat(undefined, {
        weekday:"long", month:"long", day:"numeric", year:"numeric"
    }).format(now);

    return (
        <div className="date-banner" aria-label={dateStr}>
            <span className="date-text">{dateStr}</span>
            <style>{`
        .date-banner{
          width: 100%; max-width: var(--colWidth);
          padding: .5rem .9rem;
          border: 1.5px solid rgba(255,255,255,.9);
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.18), 0 8px 18px rgba(0,0,0,.18);
        }
        .date-text{
          display:block; text-align:center; text-transform:uppercase;
          font-weight:700; color:#fff;
          letter-spacing:.05em;
          font-size: clamp(.95rem, 2.3vw, 1.1rem);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
      `}</style>
        </div>
    );
}
