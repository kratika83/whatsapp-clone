import dotenv from 'dotenv';
dotenv.config();

import connect from './config/db.js';
connect();

import { Server as IOServer } from 'socket.io';

import express from 'express';
const app = express();

import cors from 'cors';
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 4000;

import http from 'http';
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log('Socket connected', socket.id);
});

app.use((req, res, next) => {
    console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});


import webhookRouter from './routes/webhookRoute.js';
app.use('/api/webhook', webhookRouter);

import conversationRouter from './routes/conversationRoute.js';
app.use('/api/conversations', conversationRouter);

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on ${PORT}`);
});
