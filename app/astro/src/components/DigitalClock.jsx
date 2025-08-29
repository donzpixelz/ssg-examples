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
        <div className="digital-slab">
            <div className="digital digital-large">
                {h}:{mm}:{ss}
                <div style={{ fontSize: "0.9rem", marginTop: ".25rem", color: "#ffb3b3" }}>{ampm}</div>
            </div>
        </div>
    );
}
