import { useState } from "react";

export default function Counter() {
    const [value, set] = useState(0);
    return (
        <div>
            <p>Value: <strong>{value}</strong></p>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                <button onClick={() => set(v => v + 1)}>+1</button>
                <button onClick={() => set(v => v + 5)}>+5</button>
                <button onClick={() => set(0)}>Reset</button>
            </div>
        </div>
    );
}
