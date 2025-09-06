import messageModel from "../models/messageModel.js";
import { v4 as uuidv4 } from 'uuid';
import { Server as IOServer } from 'socket.io';
import http from 'http';

import express from 'express';
const app = express();

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

const emit = (event, payload) => io.emit(event, payload);

/* Webhook endpoint */
const webhookController = async (req, res) => {
    const payload = req.body;
    try {
        if (payload.messages && Array.isArray(payload.messages)) {
            const inserted = [];
            for (const msg of payload.messages) {
                const message_id = msg.id || msg.message_id || uuidv4();
                const wa_id = msg.from || msg.sender || (msg.contact && msg.contact.wa_id) || null;
                const name = msg.profile?.name || msg.contact?.name || null;
                const text = msg.text?.body || (typeof msg.body === 'string' ? msg.body : null);
                const ts = msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date();

                const doc = {
                    message_id,
                    meta_msg_id: msg.meta_msg_id || msg.context?.id || null,
                    wa_id,
                    from: msg.from,
                    to: msg.to,
                    name,
                    text,
                    type: msg.type || 'text',
                    direction: msg.from === process.env.MY_WHATSAPP_NUMBER ? 'outgoing' : 'incoming',
                    status: msg.status || 'sent',
                    statusHistory: [
                        {
                            status: msg.status || 'sent',
                            ts
                        }
                    ],
                    raw: msg,
                    timestamp: ts
                };

                try {
                    const created = await messageModel.findOneAndUpdate(
                        { message_id },
                        { $setOnInsert: doc },
                        { upsert: true, new: true }
                    );
                    inserted.push(created);
                    emit('message:new', created);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Insert error', e.message);
                }
            }
            return res.json({ inserted: inserted.length });
        }

        if (payload.statuses && Array.isArray(payload.statuses)) {
            const updated = [];
            for (const st of payload.statuses) {
                const messageId = st.id || st.message_id || st.meta_msg_id;
                const status = st.status || st.state;
                const ts = st.timestamp ? new Date(Number(st.timestamp) * 1000) : new Date();

                if (messageId) {
                    const msgDoc = await messageModel.findOneAndUpdate(
                        { $or: [{ message_id: messageId }, { meta_msg_id: messageId }] },
                        { $set: { status, updatedAt: new Date() }, $push: { statusHistory: { status, ts } } },
                        { new: true }
                    );
                    if (msgDoc) {
                        updated.push(msgDoc);
                        emit('message:update', msgDoc);
                    }
                }
            }
            return res.json({ updated: updated.length });
        }

        return res.status(400).json({ ok: false, note: 'payload missing messages or statuses' });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Webhook error', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};

export default webhookController;