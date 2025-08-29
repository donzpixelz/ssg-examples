import { useState } from 'react';

export default function Counter({ initial = 0 }) {
    const [count, setCount] = useState(initial);
    return (
        <div className="card">
            <h2>Counter (React)</h2>
            <p style={{ margin: 0 }}>Value: <strong>{count}</strong></p>
            <p style={{ marginTop: '.5rem' }}>
                <button className="button" onClick={() => setCount(c => c + 1)}>+1</button>{' '}
                <button className="button secondary" onClick={() => setCount(0)}>Reset</button>
            </p>
        </div>
    );
}
