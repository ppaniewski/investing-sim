import express from 'express';
import { loginUser, registerUser, logoutUser } from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

router.use(verifyToken);
router.post("/logout", logoutUser);
router.get("/authenticate", (req, res) => res.status(200).json({ message: "OK" }));

export default router;