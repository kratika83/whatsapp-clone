import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API || 'http://localhost:4000';

// create single socket instance
const socket = io(API, { transports: ['websocket'] });

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/conversations/`);
      const data = res.data || [];
      setConversations(data);
      // auto-select first conversation if none selected
      if (!selected && data.length > 0) {
        setSelected(data[0].wa_id);
      }
      // debug
      // console.log('conversations', data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err.message || err);
    }
  }, [selected]);

  useEffect(() => {
    fetchConversations();
    socket.on('message:new', fetchConversations);
    socket.on('message:update', fetchConversations);

    return () => {
      socket.off('message:new', fetchConversations);
      socket.off('message:update', fetchConversations);
    };
  }, [fetchConversations]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar conversations={conversations} onSelect={setSelected} selected={selected} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selected ? (
          <ChatWindow wa_id={selected} socket={socket} />
        ) : (
          <div style={{ padding: 24 }}>No chats — try sending a webhook or use the API to create a message.</div>
        )}
      </div>
    </div>
  );
}