import asyncHandler from 'express-async-handler';
import Stock from '../models/stockModel.js';

// @route GET /api/stocks
// Example: /api/stocks?stock=AAPL&stock=META
export const getStocks = asyncHandler(async (req, res) => {
    const symbols = req.query.stock;
    if (!symbols) {
        res.status(400);
        throw new Error("Stock symbols required");
    }

    const stocks = await Stock.find({ symbol: { $in: symbols } });
    if (!stocks) {
        res.status(404);
        throw new Error("Stocks not found");
    }

    res.status(200).json(stocks);
});