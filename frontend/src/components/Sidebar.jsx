import React from 'react';

export default function Sidebar({ conversations = [], onSelect, selected }) {
    return (
        <div style={{
            width: 320,
            borderRight: '1px solid #e6e6e6',
            overflowY: 'auto',
            minWidth: 250,
            background: '#fff'
        }}>
            <div style={{ padding: 16, fontWeight: 700 }}>WhatsApp Clone</div>
            {conversations.length === 0 && (
                <div style={{ padding: 16, color: '#666' }}>No conversations found</div>
            )}
            {conversations.map((c) => {
                const last = c.lastMessage || {};
                const title = last.name || c.wa_id || 'Unknown';
                const preview = (last.text || '').slice(0, 60);
                const time = last.timestamp ? new Date(last.timestamp).toLocaleString() : '';
                return (
                    <div
                        key={c.wa_id}
                        onClick={() => onSelect(c.wa_id)}
                        style={{
                            padding: 12,
                            cursor: 'pointer',
                            background: selected === c.wa_id ? '#f0f8ff' : 'transparent',
                            borderBottom: '1px solid #f5f5f5'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600 }}>{title}</div>
                            <div style={{ fontSize: 11, color: '#999' }}>{time}</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{preview}</div>
                    </div>
                );
            })}
        </div>
    );
}
