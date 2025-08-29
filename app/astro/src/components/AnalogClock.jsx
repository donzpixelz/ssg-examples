import { useEffect, useState, useMemo } from 'react';

export default function AnalogClock({ baseSize = 220, variant = 'chip', text = 'light' }) {
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

    const w = baseSize, h = baseSize, cx = baseSize / 2, cy = baseSize / 2, r = baseSize / 2 - 8;

    const ticks = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
    const s = now.getSeconds();
    const m = now.getMinutes();
    const hr = now.getHours() % 12;

    const sAng = s * 6;
    const mAng = m * 6 + s * 0.1;
    const hAng = hr * 30 + m * 0.5;

    return (
        <div className={classes} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Clock (Analog)</h2>
            <svg
                viewBox={`0 0 ${w} ${h}`}
                style={{ width: 'min(100%, 320px)', height: 'auto' }}
                role="img"
                aria-label="Analog clock"
            >
                <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,.08)" stroke="#fff" strokeWidth="2" />
                {ticks.map(i => {
                    const ang = (i / 12) * 2 * Math.PI;
                    const x1 = cx + Math.sin(ang) * (r - 10);
                    const y1 = cy - Math.cos(ang) * (r - 10);
                    const x2 = cx + Math.sin(ang) * (r - 2);
                    const y2 = cy - Math.cos(ang) * (r - 2);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="2" strokeLinecap="round" />;
                })}
                <line x1={cx} y1={cy} x2={cx} y2={cy - (r * 0.5)} stroke="#fff" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hAng} ${cx} ${cy})`} />
                <line x1={cx} y1={cy} x2={cx} y2={cy - (r * 0.75)} stroke="#fff" strokeWidth="3" strokeLinecap="round" transform={`rotate(${mAng} ${cx} ${cy})`} />
                <line x1={cx} y1={cy + 6} x2={cx} y2={cy - (r * 0.82)} stroke="#f2c94c" strokeWidth="2" strokeLinecap="round" transform={`rotate(${sAng} ${cx} ${cy})`} />
                <circle cx={cx} cy={cy} r="3.5" fill="#fff" />
            </svg>
        </div>
    );
}
