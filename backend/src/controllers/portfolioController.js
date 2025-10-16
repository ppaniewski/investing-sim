import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Stock from '../models/stockModel.js';
import SnapshotList from '../models/snapshotListModel.js';

// @route POST /api/portfolio/buy/:stockSymbol
export const buyStock = asyncHandler(async (req, res) => {
    const shares = req.body.shares;
    if (!shares) {
        res.status(400);
        throw new Error("Share amount required");
    }

    const stockSymbol = req.params.stockSymbol;
    const stock = await Stock.find({ symbol: stockSymbol });
    if (!stock) {
        res.status(404);
        throw new Error("Stock not found");
    }

    const user = await getUserFromReq(req, res);

    // Round stock price up to the second number after the dot
    const stockPrice = Math.ceil(stock.price * 100) / 100;
    const cost = stockPrice * shares;
    const remainingMoney = user.availableCash - cost;

    if (remainingMoney < 0) {
        res.status(409);
        throw new Error("Insufficient funds");
    }

    // Charge the user
    user.availableCash -= cost;

    // Change share amount if the user already owns this stock, or add this stock if they don't
    const stockInPortfolio = user.portfolio.find(s => s.symbol === stock.symbol);
    if (stockInPortfolio) {
        const index = user.portfolio.indexOf(stockInPortfolio);
        stockInPortfolio.shares += shares;
        user.portfolio.splice(index, 1, stockInPortfolio);
    }
    else {
        const newStock = {
            symbol: stock.symbol,
            shares
        };
        user.portfolio.push(newStock);
    }

    await user.save();

    res.sendStatus(200);
});

// @route POST /api/portfolio/sell/:stockSymbol
export const sellStock = asyncHandler(async (req, res) => {
    const shares = req.body.shares;
    if (!shares) {
        res.status(400);
        throw new Error("Share amount required");
    }
   
    const stockSymbol = req.params.stockSymbol;
    const stock = await Stock.find({ symbol: stockSymbol });
    if (!stock) {
        res.status(404);
        throw new Error("Stock not found");
    }

    const user = await getUserFromReq(req, res);

    // Verify if the user owns enough shares
    const stockInPortfolio = user.portfolio.find(s => s.symbol === stock.symbol);
    if (!stockInPortfolio || stockInPortfolio.shares < shares) {
        res.status(409);
        throw new Error("User doesn't own enough shares");
    }

    // Update share holdings
    stockInPortfolio.shares -= shares;
    const index = user.portfolio.indexOf(stockInPortfolio);

    if (stockInPortfolio.shares == 0) {
        user.portfolio.splice(index, 1); // Delete stock
    }
    else {
        user.portfolio.splice(index, 1, stockInPortfolio); // Update stock
    }
    
    // Round stock price down to the second number after the dot
    const stockPrice = Math.floor(stock.price * 100) / 100;
    const cost = stockPrice * shares;

    // Give money to the user
    user.availableCash += cost;
    await user.save();

    res.sendStatus(200);
});

// @route GET /api/portfolio
export const getPortfolioStocks = asyncHandler(async (req, res) => {
    const user = await getUserFromReq(req, res);

    res.status(200).json({
        stocks: user.portfolio,
        cash: user.availableCash
    });
});

// @route GET /api/portfolio/history
export const getPortfolioHistory = asyncHandler(async (req, res) => {
    const snapshotList = await SnapshotList.find({ userId: req.user.id });
    if (!snapshotList) {
        res.sendStatus(200); // No snapshots taken yet
    }

    res.status(200).json(snapshotList.list);
});

const getUserFromReq = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("portfolio availableCash");
    if (!user) {
        res.status(403);
        throw new Error("User not found");
    }

    return user;
});