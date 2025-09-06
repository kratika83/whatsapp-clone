import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        // eslint-disable-next-line no-console
        console.log('MongoDB connected successfully');
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('MongoDB connection error', err);
        process.exit(1);
    }
}

export default connect;