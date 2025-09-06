import React from 'react';

export default function MessageBubble({ message }) {
    const isMe = message.direction === 'outgoing';
    const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    // render simple status indicator for outgoing messages
    const status = isMe ? (message.status || 'sent') : null;

    return (
        <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <div style={{
                maxWidth: '70%',
                padding: 10,
                borderRadius: 12,
                background: isMe ? '#dcf8c6' : '#fff',
                boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
            }}>
                <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{message.text}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 6, textAlign: 'right' }}>
                    {time} {isMe && <span style={{ marginLeft: 6, color: '#2e78ff' }}>• {status}</span>}
                </div>
            </div>
        </div>
    );
}
