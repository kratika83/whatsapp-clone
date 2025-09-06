import messageModel from '../models/messageModel.js';
import { v4 as uuidv4 } from 'uuid';
import { Server as IOServer } from 'socket.io';
import http from 'http';

import express from 'express';
const app = express();

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

const emit = (event, payload) => io.emit(event, payload);

/* Conversations list */
const conversationList = async (req, res) => {
    try {
        const conversations = await messageModel.aggregate([
            { $sort: { timestamp: -1 } },
            { $group: { _id: '$wa_id', lastMessage: { $first: '$$ROOT' }, count: { $sum: 1 } } },
            { $project: { wa_id: '$_id', lastMessage: 1, count: 1, _id: 0 } },
            { $sort: { 'lastMessage.timestamp': -1 } }
        ]);
        res.json(conversations);
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/* Messages for a conversation */
const conversationMessage = async (req, res) => {
    try {
        const { wa_id } = req.params;
        console.log("wa_id param:", wa_id);
        if (!wa_id) {
            return res.status(400).json({ error: "wa_id is required" });
        }
        const msgs = await messageModel.find({ wa_id: String(wa_id) }).sort({ timestamp: 1 });
        return res.json({ wa_id: String(wa_id), count: msgs.length, messages: msgs });
    } catch (err) {
        console.error("Conversation fetch error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/* Demo send (save only) */
const sendDemoMessage = async (req, res) => {
    const { wa_id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const message_id = uuidv4();
    const doc = {
        message_id,
        wa_id,
        from: process.env.MY_WHATSAPP_NUMBER || 'me',
        to: wa_id,
        name: null,
        text,
        type: 'text',
        direction: 'outgoing',
        status: 'sent',
        timestamp: new Date(),
        raw: { demo: true }
    };
    const created = await messageModel.create(doc);
    emit('message:new', created);
    res.json(created);
};

let conversationController = {
    conversationList: conversationList,
    conversationMessage: conversationMessage,
    sendDemoMessage: sendDemoMessage
};

export default conversationController;