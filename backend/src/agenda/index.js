import { Agenda } from 'agenda';
import updateStocks from './jobs/updateStocks.js';
import takeSnapshots from './jobs/takeSnapshots.js';

const startAgenda = async () => {
    const agenda = new Agenda({ db: { address: process.env.DB_CONNECTION_STRING } });

    // Register job definitions
    agenda.define("updateStockPrices", updateStocks);
    agenda.define("takePortfolioSnapshots", takeSnapshots);

    await agenda.start();

    // Run jobs. Use NY Time and match the exchange open hours with
    // a slight delay. Also delay snapshot taking by a bit to use the most 
    // recent stock prices
    agenda.every("50 9-16 * * 1-5", "updateStockPrices", {}, {
        timezone: "America/New_York",
        skipImmediate: true
    });

    agenda.every("58 9-16 * * 1-5", "takePortfolioSnapshots", {}, {
        timezone: "America/New_York",
        skipImmediate: true
    });

    process.on("SIGTERM", () => graceful(agenda));
    process.on("SIGINT", () => graceful(agenda));
}

async function graceful(agenda) {
    await agenda.stop();
    process.exit(0);
}

export default startAgenda;