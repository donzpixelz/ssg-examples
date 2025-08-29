import { useState } from "react";

export default function Counter({ initial = 0 }) {
    const [value, set] = useState(initial);

    return (
        <div className="counter-root" style={{ textAlign: "center" }}>
            {/* Big centered number with a subtle frame; no label */}
            <div className="counter-value" aria-live="polite">{value}</div>

            {/* Buttons: evenly spaced under the value */}
            <div className="counter-buttons">
                <button className="button tactile raised" onClick={() => set(v => v + 1)}>+1</button>
                <button className="button tactile raised" onClick={() => set(v => v + 5)}>+5</button>
                <button className="button tactile raised secondary" onClick={() => set(initial)}>Reset</button>
            </div>

            <style>{`
        /* Shared width for value + buttons so they align cleanly */
        .counter-root{
          --counterWidth: clamp(14rem, 40vw, 22rem);
        }

        .counter-value{
          width: var(--counterWidth);
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
          margin: 0 auto .75rem auto;
          min-width: 5.5ch; /* keeps a nice pill for 0..9999 */
        }

        /* Grid with three equal columns; centers each button in its cell */
        .counter-buttons{
          width: var(--counterWidth);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: .75rem;
          align-items: center;
          justify-items: center;
        }

        /* Let buttons keep their tactile look but fit nicely in grid */
        .counter-buttons .button{
          width: 100%;
          max-width: 7rem;   /* avoids giant buttons on very wide screens */
        }
      `}</style>
        </div>
    );
}
