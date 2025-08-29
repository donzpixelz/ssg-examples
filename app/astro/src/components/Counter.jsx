import { useState } from "react";

export default function Counter({ initial = 0 }) {
    const [value, set] = useState(initial);

    return (
        <div style={{ textAlign: "center" }}>
            {/* Big centered number with a subtle frame; no label */}
            <div className="counter-value" aria-live="polite">{value}</div>

            {/* Buttons centered under the number */}
            <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap", justifyContent:"center" }}>
                <button className="button tactile raised" onClick={() => set(v => v + 1)}>+1</button>
                <button className="button tactile raised" onClick={() => set(v => v + 5)}>+5</button>
                <button className="button tactile raised secondary" onClick={() => set(initial)}>Reset</button>
            </div>

            <style>{`
        .counter-value{
          font-size: clamp(2.4rem, 6vw, 3.6rem);
          line-height: 1.1;
          font-weight: 800;
          color: #fff;
          padding: .45rem 1.2rem;
          border: 2px solid rgba(255,255,255,.95);
          border-radius: 12px;
          box-shadow:
            0 0 0 3px rgba(255,255,255,.18) inset,
            0 6px 18px rgba(0,0,0,.18);
          margin-bottom: .6rem;
          min-width: 5.5ch; /* keeps a nice pill for 0..9999 */
        }
      `}</style>
        </div>
    );
}
