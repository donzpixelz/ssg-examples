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
                    {h}:{mm}:{ss}
                    {/* inline AM/PM same color */}
                    <span className="ampm"> {ampm}</span>
                </div>
            </div>

            <style>{`
        /* override: make slab full-width instead of inline-block */
        .digital-wide .digital-slab{
          display:block;
          width:100%;
          padding:.5rem .8rem;
        }
        /* keep the LED look, but AM/PM inline + same color */
        .digital-wide .ampm{
          font-size: .9rem;
          letter-spacing:.06em;
          vertical-align: baseline;
          color: currentColor; /* same as digits (#ff4040 via your CSS) */
          opacity:.9;
        }
      `}</style>
        </div>
    );
}
