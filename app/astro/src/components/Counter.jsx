import { useState } from "react";

export default function Counter({ initial = 0 }) {
    const [value, set] = useState(initial);

    return (
        <div className="counter">
            <div className="counter-title">COUNTER</div>
            <div className="counter-value">{value}</div>
            <div className="counter-buttons">
                <button className="button tactile raised" onClick={() => set(v => v + 1)}>+1</button>
                <button className="button tactile raised" onClick={() => set(v => v + 5)}>+5</button>
                <button className="button tactile raised secondary" onClick={() => set(initial)}>Reset</button>
            </div>

            <style>{`
        .counter{
          width:100%; max-width: var(--colWidth);
          display:flex; flex-direction:column; align-items:center; gap:.7rem;
        }
        .counter-title{
          color:#fff; font-weight:800; text-transform:uppercase;
          letter-spacing:.35em; font-size:.9rem; /* slightly smaller for balance */
        }
        .counter-value{
          width:100%; text-align:center; color:#fff; font-weight:800;
          font-size: clamp(2.2rem, 5.2vw, 3.1rem); /* ↓ scale so it doesn't overpower */
          padding:.5rem .9rem;                     /* tighter padding */
          border:2px solid rgba(255,255,255,.95); border-radius:12px;
          box-shadow: inset 0 0 0 3px rgba(255,255,255,.18), 0 6px 18px rgba(0,0,0,.18);
        }
        .counter-buttons{
          width:100%;
          display:grid; grid-template-columns:repeat(3,1fr); gap:.7rem;
        }
        .counter-buttons .button{ width:100%; max-width:7rem; }
      `}</style>
        </div>
    );
}
