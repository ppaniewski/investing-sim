import User from '../../models/userModel.js';
import SnapshotList from '../../models/snapshotListModel.js';
import Stock from '../../models/stockModel.js';

const takeSnapshots = async () => {
    const users = await User.find();

    // Take a snapshot of each of the users' portfolios
    for (const user of users) {
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

        snapshot.totalValue = totalValue;
        
        // Append the snapshot to the snapshot list and save
        snapshotList.list.push(snapshot);
        await snapshotList.save();
    }
};

export default takeSnapshots;