import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import SnapshotList from '../models/snapshotListModel.js';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, STARTING_CASH, JWT_EXPIRATION_TIME, MAX_COOKIE_AGE } from '../constants.js';

// @route POST /api/users/register
export const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400);
        throw new Error("Username and password required");
    }

    // Enforce password length
    if (password.length < MIN_PASSWORD_LENGTH) {
        res.status(400);
        throw new Error(`Password needs minimum ${MIN_PASSWORD_LENGTH} characters`);
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        res.status(400);
        throw new Error(`Max password length is ${MAX_PASSWORD_LENGTH}`);
    } 

    // Enforce username length
    if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
        res.status(400);
        throw new Error(`Username needs to be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`);
    }

    // Ensure username uniqueness
    const userTaken = await User.findOne({ username });
    if (userTaken) {
        res.status(400);
        throw new Error("Username already taken");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        password: hashedPassword,
        portfolio: [],
        availableCash: STARTING_CASH
    });

    // Make a portfolio snapshot list tied to the user
    await createInitialSnapshot(user);

    res.status(201).json({
        id: user._id,
        username
    });
});

// @route POST /api/users/login
export const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400);
        throw new Error("Username and password required");
    }

    if (username.length > MAX_USERNAME_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
        res.status(400);
        throw new Error("Username or password exceed length limits");
    }

    const user = await User.findOne({ username });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Check if password is correct
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        res.status(401);
        throw new Error("Password is incorrect");
    }

    // Create access token
    const accessToken = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: JWT_EXPIRATION_TIME }
    );

    // Send token in httpOnly cookie
    res.status(200).cookie("accessToken", accessToken, {
        httpOnly: true,
        // secure: true,
        sameSite: "strict",
        maxAge: MAX_COOKIE_AGE
    }).json({ message: "OK" });
});

// @route POST /api/users/logout
export const logoutUser = (req, res) => {
    res.status(200).clearCookie("accessToken", {
        httpOnly: true,
        // secure: true,
        sameSite: "strict",
        maxAge: MAX_COOKIE_AGE
    }).json({ message: "OK" });
};

const createInitialSnapshot = async (user) => {
    const initialSnapshot = {
        stocks: [],
        totalValue: STARTING_CASH
    };

    await SnapshotList.create({
        userId: user._id,
        list: [initialSnapshot]
    });
};