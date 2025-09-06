import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

import dotenv from "dotenv";
dotenv.config();

import connect from './../config/db';
connect();

import messageModel from '../models/messageModel.js';

const arg = process.argv[2];
if (!arg) {
    console.error('Usage: node scripts/process_payloads.js <zip-or-folder-path>');
    process.exit(1);
}

async function main() {
    let jsonFiles = [];
    const stat = fs.statSync(arg);
    if (stat.isDirectory()) {
        jsonFiles = fs.readdirSync(arg).filter(f => f.endsWith('.json')).map(f => path.join(arg, f));
    } else {
        const zip = new AdmZip(arg);
        const tmpDir = path.join(process.cwd(), 'backend', 'tmp_payloads');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        zip.extractAllTo(tmpDir, true);
        jsonFiles = fs.readdirSync(tmpDir).filter(f => f.endsWith('.json')).map(f => path.join(tmpDir, f));
    }

    for (const jfile of jsonFiles) {
        try {
            const raw = fs.readFileSync(jfile, 'utf8');
            const payload = JSON.parse(raw);

            if (payload.messages) {
                for (const msg of payload.messages) {
                    const message_id = msg.id || msg.message_id || `id-${Date.now()}-${Math.random()}`;
                    const doc = {
                        message_id,
                        meta_msg_id: msg.meta_msg_id || null,
                        wa_id: msg.from || msg.sender || null,
                        from: msg.from,
                        to: msg.to,
                        name: msg.profile?.name || null,
                        text: msg.text?.body || null,
                        type: msg.type || 'text',
                        direction: msg.from === process.env.MY_WHATSAPP_NUMBER ? 'outgoing' : 'incoming',
                        status: msg.status || 'sent',
                        raw: msg,
                        timestamp: msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date()
                    };
                    await messageModel.findOneAndUpdate(
                        { message_id: doc.message_id },
                        { $setOnInsert: doc },
                        { upsert: true, new: true }
                    );
                }
            }

            if (payload.statuses) {
                for (const st of payload.statuses) {
                    const messageId = st.id || st.message_id || st.meta_msg_id;
                    const status = st.status || st.state;
                    const ts = st.timestamp ? new Date(Number(st.timestamp) * 1000) : new Date();
                    if (messageId) {
                        await messageModel.findOneAndUpdate(
                            { $or: [{ message_id: messageId }, { meta_msg_id: messageId }] },
                            { $set: { status }, $push: { statusHistory: { status, ts } } }
                        );
                    }
                }
            }

            console.log('Processed', jfile);
        } catch (e) {
            console.error('Failed processing', jfile, e.message);
        }
    }

    console.log('Done processing payloads');
    process.exit(0);
}

main();