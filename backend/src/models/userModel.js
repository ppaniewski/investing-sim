import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    portfolio: {
        type: [{
            symbol: {
                type: String,
                required: true,
                unique: true
            },
            amount: {
                type: Number,
                required: true
            }
        }],
        required: true
    },
    availableCash: {
        type: Number,
        required: true
    }
});

export default mongoose.model("User", userSchema);