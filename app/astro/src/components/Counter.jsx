import { useState } from "react";

export default function Counter({ initial = 0 }) {
    const [value, set] = useState(initial);
    return (
        <div>
            <p>Value: <strong>{value}</strong></p>
            <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
                <button className="button tactile raised" onClick={() => set(v => v + 1)}>+1</button>
                <button className="button tactile raised" onClick={() => set(v => v + 5)}>+5</button>
                <button className="button tactile raised secondary" onClick={() => set(initial)}>Reset</button>
            </div>
        </div>
    );
}
