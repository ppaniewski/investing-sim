import { Agenda } from 'agenda';
import updateStocks from './jobs/updateStocks.js';
import takeSnapshots from './jobs/takeSnapshots.js';

const startAgenda = async () => {
    const agenda = new Agenda({ db: { address: process.env.DB_CONNECTION_STRING } });

    // Register job definitions
    agenda.define("updateStockPrices", updateStocks);
    agenda.define("takePortfolioSnapshots", takeSnapshots);

    await agenda.start();

    // Run jobs
    agenda.every("30 minutes", "updateStockPrices");
    agenda.every("3 hours", "takePortfolioSnapshots");

    process.on("SIGTERM", () => graceful(agenda));
    process.on("SIGINT", () => graceful(agenda));
}

async function graceful(agenda) {
    await agenda.stop();
    process.exit(0);
}

export default startAgenda;