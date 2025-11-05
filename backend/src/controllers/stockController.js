import asyncHandler from 'express-async-handler';
import Stock from '../models/stockModel.js';

// @route GET /api/stocks
// Example: /api/stocks?stock=AAPL&stock=META
export const getStocks = asyncHandler(async (req, res) => {
    const symbols = req.query.stock;
    if (!symbols) {
        res.status(400);
        throw new Error("Stock symbol(s) required");
    }

    let stocks = await Stock.find({ symbol: { $in: symbols } }, "symbol name price openPrice volume").lean();
    stocks = stocks.map(stock => ({ // Filter out _id
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        openPrice: stock.openPrice,
        volume: stock.volume
    }));

    if (stocks.length < 1) {
        res.status(404);
        throw new Error("Stocks not found");
    }

    res.status(200).json(stocks);
});

// @route GET /api/stocks/history
// Example: /api/stocks/history?stock=AAPL
export const getStockHistory = asyncHandler(async (req, res) => {
    const symbol = req.query.stock;
    if (!symbol || Array.isArray(symbol)) {
        res.status(400);
        throw new Error("Exactly one stock symbol required");
    }

    const key = process.env.TIINGO_API_KEY;
    let startDate = `2015-01-01`;
    const tiingoRes = await fetch(`https://api.tiingo.com/tiingo/daily/${symbol}/prices` +
        `?startDate=${startDate}&resampleFreq=weekly&columns=date,close,splitFactor&token=${key}`);
    let history = [];

    // Process Tiingo data  
    if (tiingoRes.ok) {
        const unadjustedHistory = await tiingoRes.json();
        history = adjustHistoryForSplits(unadjustedHistory);
        history = history.map(entry => ({
            date: entry.date,
            close: entry.close
        }));
    }

    // Try the NASDAQ Screener instead if Tiingo fails due to an 
    // error or because the daily limit has been exhausted 
    else {

        // Settle for a shorter timeframe because this API only allows
        // for a daily interval instead of weekly
        startDate = `2015-01-01`;
        const nasdaqRes = await fetch(`https://charting.nasdaq.com/data/charting/historical` + 
            `?symbol=${symbol}&date=${startDate}~${new Date().toISOString().split("T")[0]}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://charting.nasdaq.com/dynamic/chart.html",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });

        if (nasdaqRes.ok) {
            const json = await nasdaqRes.json();

            // The NASDAQ screener data is already adjusted for stock splits
            const processedData = json.marketData.map(entry => ({
                date: entry.Date.replace(" ", "T"),
                close: entry.Close
            }));
            history = processedData;
        }
    }

    res.status(200).json(history);
});

// @route GET /api/stocks/all 
export const getAllStocks = asyncHandler(async (req, res) => {

    // Get the symbols and names of all the stocks in the database
    let stocks = await Stock.find({}, "symbol name").lean(); 
    stocks = stocks.map(stock => ({ // Filter out _id
        symbol: stock.symbol,
        name: stock.name
    }));

    res.status(200).json(stocks);
});

const adjustHistoryForSplits = (history) => {
    // Adjust the history for stock splits, which can cause visual
    // price disparities (huge crashes in a stock's price chart)
    let totalSplitFactor = 1;

    // Extrapolate the prices backwards, keeping the current day 
    // prices accurate, and artificially lowering the previous prices to 
    // smooth out the stock splits
    for (let i = history.length - 1; i >= 0; i--) {
        const entry = history[i];
        const adjustedPrice = entry.close / totalSplitFactor;
        entry.close = Math.floor(adjustedPrice * 10000) / 10000; // Round to 4 decimal points
        totalSplitFactor = totalSplitFactor * entry.splitFactor;

        history.splice(i, 1, entry);
    }

    return history;
};