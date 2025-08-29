import { useEffect, useState } from "react";

function angles(d){
    const s = d.getSeconds();
    const m = d.getMinutes() + s/60;
    const h = (d.getHours()%12) + m/60;
    return { sec: s*6, min: m*6, hour: h*30 };
}

export default function AnalogClock(){
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const { hour, min, sec } = angles(now);

    // helper: convert angle (deg) + length to x,y
    const tip = (deg, len) => ({
        x: Math.sin((Math.PI/180)*deg) * len,
        y: -Math.cos((Math.PI/180)*deg) * len
    });

    const H = tip(hour, 50);
    const M = tip(min, 68);
    const S = tip(sec, 78);
    const S_tail = tip(sec+180, 15); // small counterweight tail

    return (
        <div className="analog">
            <svg viewBox="0 0 200 200" width="100%" height="100%" aria-label="Analog clock">
                {/* face */}
                <circle cx="100" cy="100" r="92" fill="#3d73e0" stroke="white" strokeOpacity=".35" strokeWidth="4" />

                {/* hour marks */}
                {[...Array(12)].map((_, i) => {
                    const a = i*30*Math.PI/180;
                    const x1 = 100 + Math.sin(a)*74, y1 = 100 - Math.cos(a)*74;
                    const x2 = 100 + Math.sin(a)*86, y2 = 100 - Math.cos(a)*86;
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={i%3===0?3:2} opacity=".9"/>;
                })}

                {/* hands */}
                <g transform="translate(100,100)">
                    {/* hour */}
                    <line x1="0" y1="0" x2={H.x} y2={H.y} stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                    {/* minute */}
                    <line x1="0" y1="0" x2={M.x} y2={M.y} stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
                    {/* second (red) + tiny tail so it clearly meets center */}
                    <line x1={S_tail.x} y1={S_tail.y} x2={S.x} y2={S.y} stroke="red" strokeWidth="2" strokeLinecap="round"/>

                    {/* solid red center with thin white ring */}
                    <circle cx="0" cy="0" r="4.5" fill="red"/>
                    <circle cx="0" cy="0" r="6" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".9"/>
                </g>
            </svg>

            <style>{`.analog{min-height:260px}@media(min-width:980px){.analog{min-height:320px}}`}</style>
        </div>
    );
}
