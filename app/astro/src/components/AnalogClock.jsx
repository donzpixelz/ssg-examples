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

    const tip = (deg, len) => ({
        x: Math.sin((Math.PI/180)*deg) * len,
        y: -Math.cos((Math.PI/180)*deg) * len
    });

    const H = tip(hour, 52);
    const M = tip(min, 72);
    const S = tip(sec, 80);
    const S_tail = tip(sec+180, 16);

    // positions for numbers
    const numbers = Array.from({length:12}, (_,i) => {
        const n = i+1;
        const a = n * 30 * Math.PI/180;
        const r = 70; // radius for numerals
        return { n, x: 100 + Math.sin(a)*r, y: 100 - Math.cos(a)*r };
    });

    return (
        <div className="analog">
            <svg viewBox="0 0 200 200" width="100%" height="100%" aria-label="Analog clock">
                <circle cx="100" cy="100" r="92" fill="#3d73e0" stroke="white" strokeOpacity=".35" strokeWidth="4" />

                {/* minute/hour tick marks */}
                {[...Array(60)].map((_, i) => {
                    const isHour = i % 5 === 0;
                    const a = i*6*Math.PI/180;
                    const inner = isHour ? 78 : 84;
                    const outer = 88;
                    const x1 = 100 + Math.sin(a)*inner, y1 = 100 - Math.cos(a)*inner;
                    const x2 = 100 + Math.sin(a)*outer, y2 = 100 - Math.cos(a)*outer;
                    return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                              stroke="#fff" opacity={isHour?0.95:0.6} strokeWidth={isHour?2.8:1.4}/>
                    );
                })}

                {/* numerals */}
                {numbers.map(({n,x,y}) => (
                    <text key={n} x={x} y={y+4} textAnchor="middle" fontSize="12" fill="#fff" fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">{n}</text>
                ))}

                {/* hands */}
                <g transform="translate(100,100)">
                    <line x1="0" y1="0" x2={H.x} y2={H.y} stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
                    <line x1="0" y1="0" x2={M.x} y2={M.y} stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
                    <line x1={S_tail.x} y1={S_tail.y} x2={S.x} y2={S.y} stroke="red" strokeWidth="2" strokeLinecap="round"/>

                    <circle cx="0" cy="0" r="4.8" fill="red"/>
                    <circle cx="0" cy="0" r="6.5" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".95"/>
                </g>
            </svg>

            <style>{`.analog{min-height:280px}@media(min-width:900px){.analog{min-height:320px}}`}</style>
        </div>
    );
}
