import { useEffect, useState } from "react";

export default function DigitalClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const h24 = now.getHours();
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h = ((h24 + 11) % 12) + 1;
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    return (
        <div className="digital-wide">
            <div className="digital-slab">
                <div className="digital digital-large">
                    {h}:{mm}:{ss}<span className="ampm"> {ampm}</span>
                </div>
            </div>

            <style>{`
        /* full width slab, centered content */
        .digital-wide .digital-slab{
          display:block; width:100%; padding:.6rem .9rem; text-align:center;
        }
        .digital-wide .digital-large{ display:inline-block; }
        /* AM/PM same size and color as digits */
        .digital-wide .ampm{
          font-size: 1em;           /* match the surrounding font-size */
          letter-spacing:.06em;
          color: currentColor;      /* same LED red */
          opacity: 1;
          vertical-align: baseline;
          margin-left: .35ch;
        }
      `}</style>
        </div>
    );
}
