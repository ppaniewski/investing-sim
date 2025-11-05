import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    openPrice: { // Price at the start of the trading day
        type: Number,
        required: true
    },
    volume: { // In shares traded
        type: Number
    }
});

export const Stock = mongoose.model("Stock", stockSchema);

export const DelistedStock = mongoose.model("DelistedStock", stockSchema, "delisted_stocks");

export default Stock;
