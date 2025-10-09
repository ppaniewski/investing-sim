import mongoose from 'mongoose';

async function connectMongoDB() {
    try {
        const connect = await mongoose.connect(process.env.DB_CONNECTION_STRING);
        if (process.env.NODE_ENV === "development") {
            console.log(`MongoDB connected: ${connect.connection.host}`);
        }
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
}

export default connectMongoDB;