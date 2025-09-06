import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import MessageInput from './MessageInput.jsx';
import MessageBubble from './MessageBubble.jsx';

const API = import.meta.env.VITE_API || 'http://localhost:4000';

export default function ChatWindow({ wa_id, socket }) {
    const [messages, setMessages] = useState([]);
    const scroller = useRef();

    useEffect(() => {
        fetchMessages();

        const onNew = (msg) => {
            if (!msg) return;
            if (msg.wa_id === wa_id) setMessages(prev => [...prev, msg]);
        };
        const onUpdate = (msg) => {
            if (!msg) return;
            if (msg.wa_id === wa_id) setMessages(prev => prev.map(m => m.message_id === msg.message_id ? msg : m));
        };

        socket.on('message:new', onNew);
        socket.on('message:update', onUpdate);

        return () => {
            socket.off('message:new', onNew);
            socket.off('message:update', onUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wa_id]);

    async function fetchMessages() {
        try {
            const res = await axios.get(`${API}/api/conversations/${wa_id}/messages`);
            // backend returns { wa_id, count, messages }
            const msgs = res.data?.messages || [];
            setMessages(msgs);
            // scroll to bottom after small delay
            setTimeout(() => scroller.current?.scrollIntoView({ behavior: 'smooth' }), 120);
        } catch (e) {
            console.error('Fetch messages failed', e);
            setMessages([]);
        }
    }

    async function sendMessage(text) {
        try {
            const res = await axios.post(`${API}/api/conversations/${wa_id}/send`, { text });
            // backend returns the created message document
            const created = res.data;
            setMessages(prev => [...prev, created]);
            setTimeout(() => scroller.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (e) {
            console.error('Send failed', e);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #eee', background: '#f7f7f7', fontWeight: 600 }}>
                {wa_id}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f2f6f4' }}>
                {messages.length === 0 && <div style={{ color: '#666' }}>No messages yet</div>}
                {messages.map(m => <MessageBubble key={m.message_id || m._id} message={m} />)}
                <div ref={scroller} />
            </div>

            <div style={{ padding: 12, borderTop: '1px solid #eee', background: '#fff' }}>
                <MessageInput onSend={sendMessage} />
            </div>
        </div>
    );
}
