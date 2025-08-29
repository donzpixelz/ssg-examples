import { useState } from "react";

export default function ProgressRingDemo(){
    const [pct, setPct] = useState(42);
    return (
        <div className="ring-wrap">
            <ProgressRing percent={pct} size={160} stroke={14}/>
            <input type="range" min="0" max="100" value={pct} onChange={e=>setPct(+e.target.value)} />
            <style>{`
        .ring-wrap{ display:flex; flex-direction:column; align-items:center; gap:.6rem; color:#fff }
        .ring-wrap input{ width:100% }
      `}</style>
        </div>
    );
}

function ProgressRing({percent=0, size=160, stroke=12}){
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = c * (percent/100);
    const gap = c - dash;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Progress ${percent}%`}>
            <defs>
                <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="rgba(0,0,0,.35)" />
                </filter>
            </defs>
            <g transform={`translate(${size/2} ${size/2})`}>
                <circle r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={stroke}/>
                <circle
                    r={r} fill="none" stroke="#fff" strokeWidth={stroke}
                    strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
                    transform="rotate(-90)" filter="url(#s)"
                />
                <text x="0" y="8" textAnchor="middle" fontWeight="800" fill="#fff" fontSize="28">{percent}%</text>
            </g>
        </svg>
    );
}
