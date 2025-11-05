import express from 'express';
import { getAllStocks, getStocks, getStockHistory } from '../controllers/stockController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.get("/all", getAllStocks);

router.use(verifyToken);
router.get("/", getStocks);
router.get("/history", getStockHistory);

export default router;