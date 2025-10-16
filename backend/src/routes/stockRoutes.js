import express from 'express';
import { getStocks } from '../controllers/stockController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.use(verifyToken);
router.get("/", getStocks);

export default router;