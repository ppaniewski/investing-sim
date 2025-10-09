import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const { accessToken } = req.cookies;
    if (!accessToken) {
        res.status(401);
        throw new Error("User not authenticated");
    }

    try {
        const decoded = jwt.verify(accessToken, proccess.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401);
        throw new Error("User not authenticated");
    }
};

export default verifyToken;