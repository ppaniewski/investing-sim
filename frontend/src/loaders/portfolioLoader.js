export default async function portfolioLoader() {
    // Get portfolio stocks
    const portfolioRes = await fetch("/api/portfolio");
    const portfolio = await portfolioRes.json();
    if (!portfolioRes.ok) {
        throw new Response("Failed to load portfolio stocks", { status: portfolioRes.status });
    }

    // Get portfolio history
    const historyRes = await fetch("/api/portfolio/history");
    const snapshots = await historyRes.json(); 
    if (!historyRes.ok) {
        throw new Response("Failed to load portfolio history", { status: historyRes.status });
    }

    // Get stocks complete with the current prices and P/L values since 
    // the start of each position
    const fullStocks = await getFullStocks(portfolio.stocks, snapshots);

    // Count up the stock values
    let stockValue = 0;
    for (const stock of fullStocks) {
        stockValue += stock.price * stock.shares;
    }
    
    return {
        stocks: fullStocks,
        stockValue,
        cash: portfolio.cash,
        snapshots
    };
}

async function getFullStocks(portfolioStocks, snapshots) {
    if (portfolioStocks.length === 0) {
        return [];
    }

    // Get the current market prices of each of the user's stocks
    let stockQueryString = ``;
    for (const stock of portfolioStocks) {
        stockQueryString += `stock=${stock.symbol}&`;
    }

    const stockRes = await fetch(`/api/stocks?${stockQueryString}`);
    if (!stockRes.ok) {
        throw new Response(`Failed to load stocks`, { status: stockRes.status });
    }

    const stockData = await stockRes.json();
    if (stockData.length !== portfolioStocks.length) {
        throw new Response(`Failed to load all stocks`, { status: 404 });
    }

    // Sort stocks alphabetically by symbol in both arrays for efficient comparison
    const sortedPortfolioStocks = portfolioStocks.sort((a, b) => a.symbol.localeCompare(b.symbol));    
    const sortedStocks = stockData.sort((a, b) => a.symbol.localeCompare(b.symbol));

    // Attach market price, name, opening price and volume to each stock
    let newStocks = [];
    for (const i in sortedStocks) {
        const stock = sortedStocks[i];
        const portfolioStock = sortedPortfolioStocks[i];

        const profit = getStockProfit(portfolioStock, stock.price, snapshots);

        const newStock = {
            ...portfolioStock,
            name: stock.name,
            price: stock.price,
            openPrice: stock.openPrice,
            volume: stock.volume,
            profit
        };

        newStocks.push(newStock);
    }

    return newStocks;
}

// Get the profit from the stock since the start of the current position,
// as far back as the share amount owned was the same
function getStockProfit(stock, currentPrice, snapshots) {
    let initialPrice = -1;

    // Get the initial price
    for (let i = snapshots.length - 1; i >= 0; i--) {
        let sameShares = false;

        for (const s of snapshots[i].stocks) {
            if (s.symbol !== stock.symbol) {
                continue;
            }

            if (s.shares !== stock.shares) {
                continue;
            }

            // Assign new price and keep going backwards, as 
            // we haven't yet reached a snapshot where this stock either
            // doesn't exist or the share amount isn't the same
            initialPrice = s.price;
            sameShares = true; 
            break;
        }

        if (!sameShares) {
            break;
        }
    }

    if (initialPrice === -1) {
        return 0;
    }

    return Math.floor((currentPrice - initialPrice) * stock.shares * 100) / 100;
}