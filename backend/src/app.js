import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectMongoDB from './config/dbConnect.js';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

dotenv.config();
connectMongoDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;