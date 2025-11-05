import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import User from '../../models/userModel.js';
import SnapshotList from '../../models/snapshotListModel.js';
import Stock from '../../models/stockModel.js';

const takeSnapshots = async () => {
    const users = await User.find();

    // Take a snapshot of each of the users' portfolios
    for (const user of users) {
        try {
            let snapshotList = await SnapshotList.findOne({ userId: user._id });
            if (!snapshotList) {
                snapshotList = await SnapshotList.create({
                    userId: user._id,
                    list: []
                });
            }

            const snapshot = {
                stocks: [],
                totalValue: 0
            };

            // Access all the stocks in the user's portfolio at once to avoid
            // making multiple database queries
            const userStocks = user.portfolio.map(stock => stock.symbol);
            const stocks = await Stock.find({ symbol: { $in: userStocks } });

            // Iterate over each of the user's stocks and add it to the snapshot
            let totalValue = 0;
            for (const stock of user.portfolio) {
                const stockReference = stocks.find(s => s.symbol === stock.symbol);

                snapshot.stocks.push({
                    symbol: stock.symbol,
                    price: stockReference.price,
                    shares: stock.shares
                });

                // Add stock value to total
                totalValue += stock.shares * stockReference.price;
            }

            // Sum up the stock value and the user's cash
            snapshot.totalValue = Math.round((totalValue + user.availableCash) * 100) / 100;
            
            // Append the snapshot to the snapshot list and save
            snapshotList.list.push(snapshot);
            await snapshotList.save();
        }
        catch (err) {
            await logError(err, user);
        }
    }  

    if (process.env.NODE_ENV === "development") {
        console.log("Finished taking portfolio snapshots");
    }
};

const logError = async (err, user) => {
    console.error([
        "Error while taking portfolio snapshot",
        `User ${user.username} ${user._id} portfolio snapshot failed`,
        `${err.stack}`
    ].join("\n"));

    if (process.env.NODE_ENV === "development") {
        try {
            // Log error to file 
            const logsDir = path.join(process.cwd(), "logs", "takeSnapshots");
            await mkdir(logsDir, { recursive: true });
            const logName = `error${new Date().toISOString().replaceAll(":", "-")}.log`;
            const fullPath = path.join(logsDir, logName);

            const logContent = `User ${user.username} ${user._id} portfolio snapshot failed\n` + err.stack;

            await writeFile(fullPath, logContent);
        }
        catch (fileErr) {
            console.error("Failed to write snapshot error log\n" + fileErr.stack);
        }
    }
};

export default takeSnapshots;