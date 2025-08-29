import { useEffect, useState } from "react";

function handAngles(date) {
    const s = date.getSeconds();
    const m = date.getMinutes() + s / 60;
    const h = (date.getHours() % 12) + m / 60;
    return {
        sec: s * 6,            // 360/60
        min: m * 6,            // 360/60
        hour: h * 30           // 360/12
    };
}

export default function AnalogClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const { hour, min, sec } = handAngles(now);

    return (
        <div className="analog">
            <svg viewBox="0 0 200 200" width="100%" height="100%" aria-label="Analog clock">
                <defs>
                    <filter id="inset" x="-50%" y="-50%" width="200%" height="200%">
                        <feOffset dx="0" dy="2" />
                        <feGaussianBlur stdDeviation="2" result="offset-blur" />
                        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                        <feFlood floodColor="black" floodOpacity=".35" result="color" />
                        <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                        <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                    </filter>
                </defs>

                {/* face */}
                <circle cx="100" cy="100" r="92" fill="#3d73e0" stroke="white" strokeOpacity=".35" strokeWidth="4" />

                {/* hour marks */}
                {[...Array(12)].map((_, i) => {
                    const a = (i * 30) * Math.PI / 180;
                    const x1 = 100 + Math.sin(a) * 74;
                    const y1 = 100 - Math.cos(a) * 74;
                    const x2 = 100 + Math.sin(a) * 86;
                    const y2 = 100 - Math.cos(a) * 86;
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={i % 3 === 0 ? 3 : 2} opacity=".9" />;
                })}

                {/* hands */}
                <g transform="translate(100,100)" filter="url(#inset)">
                    {/* hour hand */}
                    <line
                        x1="0" y1="8" x2={Math.sin((Math.PI/180)*hour)*50} y2={-Math.cos((Math.PI/180)*hour)*50}
                        stroke="#fff" strokeWidth="5" strokeLinecap="round"
                    />
                    {/* minute hand */}
                    <line
                        x1="0" y1="10" x2={Math.sin((Math.PI/180)*min)*68} y2={-Math.cos((Math.PI/180)*min)*68}
                        stroke="#fff" strokeWidth="3.5" strokeLinecap="round"
                    />
                    {/* second hand (RED, as requested) */}
                    <line
                        x1="0" y1="14" x2={Math.sin((Math.PI/180)*sec)*78} y2={-Math.cos((Math.PI/180)*sec)*78}
                        stroke="red" strokeWidth="2" strokeLinecap="round"
                    />
                    {/* center pin */}
                    <circle cx="0" cy="0" r="4" fill="#fff" stroke="red" strokeWidth="1.5" />
                </g>
            </svg>

            <style>{`
        .analog { min-height: 260px; }
        @media (min-width: 980px){ .analog { min-height: 320px; } }
      `}</style>
        </div>
    );
}
