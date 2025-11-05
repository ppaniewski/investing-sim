import { writeFile, mkdir } from 'fs/promises';
import { Stock, DelistedStock } from '../../models/stockModel.js';
import User from '../../models/userModel.js';
import path from 'path';
import Papa from 'papaparse';
import stooqSymbols from '../stockSymbols.json' with { type: 'json' };

const updateStocks = async () => {
    try {
        const freshStockData = await fetchStockData();
        const freshStocks = processStockData(freshStockData);
        
        const freshStockSymbols = freshStocks.map(stock => stock.symbol);
        const delistedStocks = await handleDelistedStocks(freshStockSymbols);

        const newStocks = await addNewStocks(freshStocks);

        const existingStocks = await updateExistingStocks(freshStocks, newStocks, delistedStocks);

        // Make success logs if in development
        if (process.env.NODE_ENV === "development") {
            console.log("Updating stock prices succeeded");

            try {
                const logsDir = path.join(process.cwd(), "logs", "updateStocks");
                await mkdir(logsDir, { recursive: true });
                const logName = `${new Date().toISOString().replaceAll(":", "-")}.log`;
                const fullPath = path.join(logsDir, logName);

                let logContent = [
                    `Stocks updated: ${existingStocks.length}`,
                    `Stocks added: ${newStocks.length}`,
                    `Stocks delisted: ${delistedStocks.length}`,
                    `Raw stocks fetched: ${freshStockData.length}`,
                    `Stock data after processing (${freshStocks.length} stocks):\n`
                ].join("\n");            
                logContent += freshStocks.map(stock => JSON.stringify(stock, null, 2)).join("\n");

                await writeFile(fullPath, logContent);
            }
            catch (fileErr) {
                console.error("Failed to write stock update log\n" + fileErr.stack);
            }
        }
    }
    catch (err) {
        await logError(err);
    }
};

const logError = async (err) => {
    console.error("Updating stock prices failed\n" + err.stack);

    if (process.env.NODE_ENV === "development") {
        try {
            // Log error to file
            const logsDir = path.join(process.cwd(), "logs", "updateStocks");
            await mkdir(logsDir, { recursive: true });
            const logName = `error${new Date().toISOString().replaceAll(":", "-")}.log`;
            const fullPath = path.join(logsDir, logName);

            const logContent = `Error: ${err.message}\n` + err.stack;

            await writeFile(fullPath, logContent);
        }
        catch (fileErr) {
            console.error("Failed to write stock update error log\n" + fileErr.stack);
        }
    }
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchStockData = async () => {
    let stockData = [];
    const batchSize = 100;
    const timeBetweenRequests = 3000; // In milliseconds
    const fieldSelectString = "socvn"; // Symbol, open, close, volume, name

    // Batch requests to the api, multiple symbols at a time
    for (let i = stooqSymbols.length; i > 0; i -= batchSize) {
        const sliceStart = stooqSymbols.length - i;
        const sliceEnd = sliceStart + batchSize <= stooqSymbols.length ? sliceStart + batchSize : stooqSymbols.length;
        const currentSymbols = stooqSymbols.slice(sliceStart, sliceEnd);
        const symbolString = currentSymbols.join("+");

        const res = await fetch(`https://stooq.com/q/l/?s=${symbolString}&f=${fieldSelectString}&e=csv&h`);
        if (!res.ok) {
            throw new Error([
                `Updating stock prices failed, couldn't fetch stock data.`,
                `Status: ${res.status} ${res.statusText}.`
            ].join("\n"));
        }

        // Parse csv response
        const csvString = await res.text();
        const result = Papa.parse(csvString, { 
            header: true,
            skipEmptyLines: "greedy"
        });

        stockData = stockData.concat(result.data); // Append the current batch
        await wait(timeBetweenRequests);
    }

    return stockData;
};

const processStockData = (freshStockData) => {
    return freshStockData.map(stock => {
        const symbol = stock.Symbol.toUpperCase().split(".US")[0].replace("/", "").replace(":", "");
        const price = !isNaN(Number(stock.Close)) ? round2(Number(stock.Close)) : undefined;
        const openPrice = !isNaN(Number(stock.Open)) ? round2(Number(stock.Open)) : undefined;
        const volume = !isNaN(Number(stock.Volume)) ? round2(Number(stock.Volume)) : undefined;

        return {
            symbol,
            name: stock.Name,
            price,
            openPrice,
            volume
        };
    }).filter(stock => {
        if (stock.price != null) {
            return true;
        }
        else {
            return false;
        }
    });
}

const handleDelistedStocks = async (freshStockSymbols) => {
    // Find all the stocks that disappeared since the last update
    const delistedStocks = await Stock.find({
        symbol: { $nin: freshStockSymbols } 
    }).lean();
    
    // Get all the users
    const users = await User.find();

    // Add all the delisted stocks to their own collection,
    // and delete all of them from the stocks collection
    for (const stock of delistedStocks) {

        // Check if any users currently own this now delisted stock,
        // if so then liquidate that stock from the user's portfolio
        for (const user of users) {
            await liquidateStock(user, stock);
        }

        await DelistedStock.create(stock);
        await Stock.deleteOne({ symbol: stock.symbol });

        if (process.env.NODE_ENV === "development") {
            console.log("Delisted stock:");
            console.log(JSON.stringify(stock, null, 2));
        }
    }

    return delistedStocks;
};

const liquidateStock = async (user, delistedStock) => {
    for (const i in user.portfolio) {
        const stock = user.portfolio[i];

        if (stock.symbol !== delistedStock.symbol) {
            continue;
        }

        // Remove the found stock
        user.portfolio.splice(i, 1);
        
        // Calculate the value of the stock based on its last price,
        // give the user his money back as a sign of loyalty (on the house)
        const value = round2(stock.shares * delistedStock.price);
        user.availableCash += value;

        await user.save();
        break;
    }
};

const addNewStocks = async (freshStocks) => {
    // Find and add all the stocks that are new on the exchange to the collection
    const prevStockSymbolSet = new Set(await Stock.distinct("symbol"));
    const newStocks = freshStocks.filter(stock => !prevStockSymbolSet.has(stock.symbol));

    await Stock.insertMany(newStocks, { ordered: false });
    return newStocks;
}

const updateExistingStocks = async (freshStocks, newStocks, delistedStocks) => {
    // Get an array of only the updated stocks that were already on the exchange
    const newStockSymbolSet = new Set(newStocks.map(stock => stock.symbol));
    const delistedStockSymbolSet = new Set(delistedStocks.map(stock => stock.symbol));
    const existingStocks = freshStocks.filter(stock => {
        return !newStockSymbolSet.has(stock.symbol) && !delistedStockSymbolSet.has(stock.symbol);
    });

    // Perform a bulk update operation on the existing stocks
    const updateList = existingStocks.map(stock => ({
        updateOne: {
            filter: {
                symbol: stock.symbol
            },
            update: {
                $set: {
                    price: stock.price,
                    openPrice: stock.openPrice,
                    volume: stock.volume
                }
            }
        }
    }));
    await Stock.bulkWrite(updateList);

    return existingStocks;
};

const round2 = (value) => Math.round(value * 100) / 100;

export default updateStocks;