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
    marketCap: {
        type: Number
    }
});

export const Stock = mongoose.model("Stock", stockSchema);

export const DelistedStock = mongoose.model("DelistedStock", stockSchema, "delisted_stocks");

export default Stock;
