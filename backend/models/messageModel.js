import mongoose from 'mongoose';

const StatusHistorySchema = new mongoose.Schema({
    status: String,
    ts: Date
}, { _id: false });

const messageSchema = new mongoose.Schema(
    {
        message_id: {
            type: String,
            required: true,
            index: true,
            unique: true
        },
        meta_msg_id: {
            type: String,
            index: true
        },
        wa_id: {
            type: String,
            index: true
        },
        from: String,
        to: String,
        name: String,
        text: String,
        type: String,
        direction: {
            type: String,
            enum: ['incoming', 'outgoing'],
            default: 'incoming'
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read', 'pending'],
            default: 'sent'
        },
        statusHistory: [StatusHistorySchema],
        raw: mongoose.Schema.Types.Mixed,
        timestamp: Date
    }, {
    timestamps: true,
    collection: 'Messages'
}
);

const messageModel = mongoose.model('messageSchema', messageSchema)
export default messageModel;