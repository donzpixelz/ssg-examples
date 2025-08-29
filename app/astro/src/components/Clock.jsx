import { useEffect, useState } from 'react';

export default function Clock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <div className="card">
            <h2>Clock (React)</h2>
            <p style={{ fontVariantNumeric: 'tabular-nums', margin: 0 }}>
                {now.toLocaleTimeString()}
            </p>
        </div>
    );
}
