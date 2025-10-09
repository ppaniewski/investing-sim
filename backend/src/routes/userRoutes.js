import express from 'express';
import { loginUser, registerUser, logoutUser } from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

// Require auth before logout
router.use(verifyToken);
router.post("/logout", logoutUser);

export default router;