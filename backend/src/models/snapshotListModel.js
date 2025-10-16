import mongoose from 'mongoose';

const snapshotSchema = new mongoose.Schema({
    stocks: {
        type: [{
            symbol: {
                type: String, 
                required: true,
                unique: true
            },
            price: {
                type: Number,
                required: true
            },
            shares: {
                type: Number,
                required: true
            }
        }],
        required: true
    },
    totalValue: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
});

// Each user has their own snapshot list within the snapshot_lists collection,
// which is just a compilation of their portfolio holdings over time
const snapshotListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    list: {
        type: [snapshotSchema],
        required: true
    }
});

export default mongoose.model("SnapshotList", snapshotListSchema, "snapshot_lists");