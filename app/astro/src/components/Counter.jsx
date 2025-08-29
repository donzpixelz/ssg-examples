import { useState } from 'react';

export default function Counter({ initial = 0, variant = 'chip', text = 'light' }) {
    const [count, setCount] = useState(initial);
    const classes = [
        'card',
        variant === 'chip' ? 'card--chip' : '',
        text === 'dark' ? 'text-dark' : 'text-light',
    ].join(' ').trim();

    return (
        <div className={classes}>
            <h2 style={{ marginTop: 0 }}>Counter (React)</h2>
            <p style={{ margin: 0 }}>Value: <strong>{count}</strong></p>
            <p style={{ marginTop: '.5rem' }}>
                <button className="button" onClick={() => setCount(c => c + 1)}>+1</button>{' '}
                <button className="button secondary" onClick={() => setCount(0)}>Reset</button>
            </p>
        </div>
    );
}
