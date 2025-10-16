import { writeFile, mkdir } from 'fs/promises';
import { Stock, DelistedStock } from '../../models/stockModel.js';
import path from 'path';

const updateStocks = async () => {
    try {
        const freshStockData = await fetchStockData();

        // Process the fetched stock data
        const freshStocks = freshStockData.map(stock => {
            const rawPrice = stock.lastsale?.replace("$", "").replaceAll(",", "");
            const priceNum = Number(rawPrice);
            const validPrice = !isNaN(priceNum) ? priceNum : null;

            const rawCap = stock.marketCap?.replaceAll(",", "");
            const capNum = Number(rawCap);
            const validCap = !isNaN(capNum) ? capNum : undefined;

            return {
                symbol: stock.symbol,
                name: stock.name,
                price: validPrice,
                marketCap: validCap
            };
        }).filter(stock => {
            if (stock.price != null) {
                return true;
            }
            else {
                console.log("NOT INCLUDED STOCK DUE TO LACK OF PRICE: ");
                console.log(JSON.stringify(stock, null, 2));
                return false;
            }
        });

        const freshStockSymbols = freshStocks.map(stock => stock.symbol);
        
        // Find all the stocks that disappeared since the last update
        const delistedStocks = await Stock.find({
            symbol: { $nin: freshStockSymbols } 
        }).lean();
        
        // Add all the delisted stocks to their own collection,
        // and delete all of them from the stocks collection
        for (const stock of delistedStocks) {
            console.log("DELISTED STOCK:");
            console.log(JSON.stringify(stock, null, 2));
            await DelistedStock.create(stock);
            await Stock.deleteOne(stock);
        }

        // Find and add all the stocks that are new on the exchange to the collection
        const prevStockSymbolSet = new Set(await Stock.distinct("symbol"));
        const newStocks = freshStocks.filter(stock => !prevStockSymbolSet.has(stock.symbol));

        await Stock.insertMany(newStocks);

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
                        marketCap: stock.marketCap
                    }
                }
            }
        }));
        await Stock.bulkWrite(updateList);

        // Make logs
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

        // Add logs if in development environment
        if (process.env.NODE_ENV === "development") {
            console.log("Updating stock prices succeeded");
        }
    }
    catch (err) {
        const logsDir = path.join(process.cwd(), "logs", "updateStocks");
        await mkdir(logsDir, { recursive: true });
        const logName = `error${new Date().toISOString().replaceAll(":", "-")}.log`;
        const fullPath = path.join(logsDir, logName);

        const logContent = `Error: ${err.message}\n\nStack: ${err.stack}`;

        await writeFile(fullPath, logContent);

        if (process.env.NODE_ENV === "development") {
            console.log("Updating stock prices failed");
        }
    }
};

const fetchStockData = async () => {
    // Fetch current US stock market data from the nasdaq stock screener
    const res = await fetch("https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=10000&offset=0", {
        headers: {
            "Accept": "application/json, text/plain, /",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.nasdaq.com/market-activity/stocks/screener"
        }
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error([
            `Updating stock prices failed, couldn't fetch stock data.`,
            `Status: ${res.status} ${res.statusText}.`,
            `Message: ${data.message}`
        ].join("\n"));
    }

    return data.data.table.rows;
};

export default updateStocks;