import { useEffect, useState } from 'react';

export default function Clock({ variant = 'chip', text = 'light' }) {
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

    return (
        <div className={classes}>
            <h2 style={{ marginTop: 0 }}>Clock (React)</h2>
            <div className="digital-slab">
        <span className="digital digital-large">
          {now.toLocaleTimeString()}
        </span>
            </div>
        </div>
    );
}
