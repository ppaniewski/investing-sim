import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Stock from '../models/stockModel.js';
import SnapshotList from '../models/snapshotListModel.js';

// @route POST /api/portfolio/buy/:stockSymbol
export const buyStock = asyncHandler(async (req, res) => {
    const { shares, amount } = req.body;
    if (!shares && !amount) {
        res.status(400);
        throw new Error("Share or dollar amount required");
    }

    const stockSymbol = req.params.stockSymbol;
    const stock = await Stock.findOne({ symbol: stockSymbol });
    if (!stock) {
        res.status(404);
        throw new Error("Stock not found");
    }

    const user = await getUserFromReq(req, res);

    let cost;
    let sharesToBuy;
    // Handle purchase by shares
    if (shares) {
        if (shares <= 0) {
            res.status(400);
            throw new Error("Shares must be positive");
        } 

        sharesToBuy = floor2(shares);
        cost = floor2(stock.price * shares);
    }
    // Handle purchase by dollar amount
    else {
        if (amount <= 0) {
            res.status(400);
            throw new Error("Amount must be positive");
        }

        sharesToBuy = floor2(amount / stock.price);
        cost = floor2(sharesToBuy * stock.price);
    }

    if (sharesToBuy <= 0) {
        res.status(400);
        throw new Error("The purchase amount must be worth at least 1% of a share");
    }

    // Calculate remaining money
    const remainingMoney = user.availableCash - cost;
    if (remainingMoney < 0) {
        res.status(409);
        throw new Error("Insufficient funds");
    }

    // Charge user
    user.availableCash = round2(remainingMoney);

    // Change share amount if the user already owns this stock, or add this stock if they don't
    const stockInPortfolio = user.portfolio.find(s => s.symbol === stock.symbol);
    if (stockInPortfolio) {
        const index = user.portfolio.indexOf(stockInPortfolio);
        stockInPortfolio.shares += sharesToBuy;
        stockInPortfolio.shares = floor2(stockInPortfolio.shares);
        user.portfolio.splice(index, 1, stockInPortfolio);
    }
    else {
        const newStock = {
            symbol: stock.symbol,
            shares: sharesToBuy
        };
        user.portfolio.push(newStock);
    }

    await user.save();

    res.status(200).json({
        success: true
    });
});

// @route POST /api/portfolio/sell/:stockSymbol
export const sellStock = asyncHandler(async (req, res) => {
    const { shares, amount } = req.body;
    if (!shares && !amount) {
        res.status(400);
        throw new Error("Share or dollar amount required");
    }
   
    const stockSymbol = req.params.stockSymbol;
    const stock = await Stock.findOne({ symbol: stockSymbol });
    if (!stock) {
        res.status(404);
        throw new Error("Stock not found");
    }

    const user = await getUserFromReq(req, res);

    // Get the stock in the user's portfolio
    const stockInPortfolio = user.portfolio.find(s => s.symbol === stock.symbol);
    if (!stockInPortfolio) {
        res.status(409);
        throw new Error("User doesn't own enough shares");
    }

    let proceeds;
    let sharesToSell;
    // Handle sell by shares
    if (shares) {
        if (shares <= 0) {
            res.status(400);
            throw new Error("Shares must be positive");
        }

        sharesToSell = floor2(shares);
        proceeds = floor2(shares * stock.price);
    }
    // Handle sell by amount
    else {
        if (amount <= 0) {
            res.status(400);
            throw new Error("Amount must be positive");
        }

        const positionValue = floor2(stockInPortfolio.shares * stock.price);

        // Ensure that the whole position gets sold without rounding errors leaving 0.01 share
        if (amount >= positionValue) {
            sharesToSell = stockInPortfolio.shares;
        }
        else {
            sharesToSell = floor2(amount / stock.price);
        }

        proceeds = floor2(sharesToSell * stock.price);
    }

    if (stockInPortfolio.shares < sharesToSell) {
        res.status(409);
        throw new Error("User doesn't own enough shares");
    }

    // Update share holdings
    stockInPortfolio.shares -= sharesToSell;
    stockInPortfolio.shares = floor2(stockInPortfolio.shares);
    const index = user.portfolio.indexOf(stockInPortfolio);

    if (stockInPortfolio.shares <= 0) {
        user.portfolio.splice(index, 1); // Delete stock
    }
    else {
        user.portfolio.splice(index, 1, stockInPortfolio); // Update stock
    }

    // Give money to the user, round the cash down to 2 decimal points
    user.availableCash += proceeds;
    user.availableCash = round2(user.availableCash);

    await user.save();

    res.status(200).json({
        success: true
    });
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
    const snapshotList = await SnapshotList.findOne({ userId: req.user.id });

    res.status(200).json(snapshotList?.list || []);
});

const getUserFromReq = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("portfolio availableCash");
    if (!user) {
        res.status(403);
        throw new Error("User not found");
    }

    return user;
});

const floor2 = (value) => Math.floor(value * 100) / 100;
const round2 = (value) => Math.round(value * 100) / 100;