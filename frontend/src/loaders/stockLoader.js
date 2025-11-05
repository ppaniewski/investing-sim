export default async function stockLoader({ params }) {

    // Get stock data
    const stockRes = await fetch(`/api/stocks?stock=${params.stockSymbol}`);
    if (stockRes.status == 404) {
        throw new Response("Stock not found", { status: 404 });
    }
    else if (!stockRes.ok) {
        throw new Response("Failed to load stock", { status: stockRes.status })
    }

    const stockJson = await stockRes.json();
    const stock = stockJson[0];

    // Get user portfolio
    const portfolioRes = await fetch("/api/portfolio");
    if (!portfolioRes.ok) {
        throw new Response("Failed to load portfolio stocks", { status: portfolioRes.status });
    }

    const portfolio = await portfolioRes.json();
    let ownedShares = 0;

    // Search the user's portfolio for the current stock
    // and grab the owned shares if there are any
    for (const portfolioStock of portfolio.stocks) {
        if (portfolioStock.symbol === stock.symbol) {
            ownedShares = portfolioStock.shares;
            break;
        }
    }

    return {
        stock,
        ownedShares,
        cash: portfolio.cash
    };
}