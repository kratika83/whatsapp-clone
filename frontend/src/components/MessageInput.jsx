import React, { useState } from 'react';

export default function MessageInput({ onSend }) {
    const [val, setVal] = useState('');

    function submit(e) {
        e.preventDefault();
        const text = val.trim();
        if (!text) return;
        onSend(text);
        setVal('');
    }

    return (
        <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
            <input
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="Type a message"
                style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 22,
                    border: '1px solid #ddd',
                    outline: 'none'
                }}
            />
            <button type="submit" style={{ padding: '8px 14px', borderRadius: 8 }}>Send</button>
        </form>
    );
}
