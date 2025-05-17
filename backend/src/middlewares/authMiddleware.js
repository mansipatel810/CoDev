const userModel = require('../models/userModel/user.model');
const jwt = require('jsonwebtoken');
const customError=require('../utils/customError.js')
const cacheClient=require('../services/cacheService/cache.service ')

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token  || req.headers.authorization?.split(" ")[1] || req.body.token;
        // console.log("Token found in request:  midddleware ", token);
        if (!token) {
            return next(new customError("You are not logged in", 401));
        }

        const isblackListToken = await cacheClient.get(token);
        if (isblackListToken) {
            console.log("blacklist token", isblackListToken);
            return next(new customError("Unauthorized access", 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email }).select('-password');
        if (!user) {
            return next(new customError("You are not logged in", 401));
        }
        req.user = user; // Includes userName
        next();
    } catch (error) {
        return next(new customError("Error in authentication", 400));
    }
};

module.exports=authMiddleware