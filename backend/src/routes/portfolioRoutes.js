import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { buyStock, sellStock, getPortfolioStocks, getPortfolioHistory } from '../controllers/portfolioController.js';

const router = express.Router();

// Require authentication for every route
router.use(verifyToken);
router.post("/buy/:stockSymbol", buyStock);
router.post("/sell/:stockSymbol", sellStock);
router.get("/history", getPortfolioHistory);
router.get("/", getPortfolioStocks);

export default router;