import { useEffect, useState, useMemo } from 'react';

export default function AnalogClock({ size = 160, variant = 'chip', text = 'light' }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const classes = [
        'card',
        variant === 'chip' ? 'card--chip' : '',
        text === 'dark' ? 'text-dark' : 'text-light',
    ].join(' ').trim();

    const w = size, h = size, cx = size / 2, cy = size / 2, r = size / 2 - 8;

    const ticks = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours() % 12;

    const secAng = sec * 6;                         // 6° per second
    const minAng = min * 6 + sec * 0.1;             // 6° per minute + 0.1° per sec
    const hrAng  = hr * 30 + min * 0.5;             // 30° per hour + 0.5° per min

    return (
        <div className={classes}>
            <h2 style={{ marginTop: 0 }}>Clock (Analog)</h2>
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Analog clock">
                {/* face */}
                <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,.08)" stroke="#fff" strokeWidth="2" />
                {/* hour ticks */}
                {ticks.map(i => {
                    const ang = (i / 12) * 2 * Math.PI;
                    const x1 = cx + Math.sin(ang) * (r - 10);
                    const y1 = cy - Math.cos(ang) * (r - 10);
                    const x2 = cx + Math.sin(ang) * (r - 2);
                    const y2 = cy - Math.cos(ang) * (r - 2);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="2" strokeLinecap="round" />;
                })}
                {/* hour hand */}
                <line
                    x1={cx} y1={cy}
                    x2={cx} y2={cy - (r * 0.5)}
                    stroke="#fff" strokeWidth="4" strokeLinecap="round"
                    transform={`rotate(${hrAng} ${cx} ${cy})`}
                />
                {/* minute hand */}
                <line
                    x1={cx} y1={cy}
                    x2={cx} y2={cy - (r * 0.75)}
                    stroke="#fff" strokeWidth="3" strokeLinecap="round"
                    transform={`rotate(${minAng} ${cx} ${cy})`}
                />
                {/* second hand (gold accent) */}
                <line
                    x1={cx} y1={cy + 6}
                    x2={cx} y2={cy - (r * 0.82)}
                    stroke="#f2c94c" strokeWidth="2" strokeLinecap="round"
                    transform={`rotate(${secAng} ${cx} ${cy})`}
                />
                {/* hub */}
                <circle cx={cx} cy={cy} r="3.5" fill="#fff" />
            </svg>
        </div>
    );
}
