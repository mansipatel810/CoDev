const userModel = require('../models/userModel/user.model');
const jwt = require('jsonwebtoken');
const customError=require('../utils/customError.js')
// const cacheClient=require('../services/cacheService/cache.service ')

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1] || req.body.token;
        if (!token) {
            return next(new customError("You are not logged in", 401));
        }

        // JWT verification — throws JsonWebTokenError or TokenExpiredError if invalid
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            const msg = jwtErr.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid token';
            return next(new customError(msg, 401));
        }

        // DB lookup — separate try so a MongoDB error doesn't look like an auth error
        let user;
        try {
            user = await userModel.findOne({ email: decoded.email }).select('-password');
        } catch (dbErr) {
            console.error('authMiddleware DB error:', dbErr.message);
            return next(new customError("Server error during authentication", 500));
        }

        if (!user) {
            return next(new customError("You are not logged in", 401));
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('authMiddleware unexpected error:', error.message);
        return next(new customError("Error in authentication", 400));
    }
};

module.exports=authMiddleware