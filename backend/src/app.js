import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectMongoDB from './config/dbConnect.js';
import startAgenda from './agenda/index.js';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import stockRoutes from './routes/stockRoutes.js';

const app = express();

dotenv.config();
await connectMongoDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/stocks", stockRoutes);

app.use(errorHandler);

startAgenda();

export default app;