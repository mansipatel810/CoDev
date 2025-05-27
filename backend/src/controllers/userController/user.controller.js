const userModel = require('../../models/userModel/user.model');
const { validationResult } = require('express-validator');
const customError = require('../../utils/customError.js');
const cacheClient = require('../../services/cacheService/cache.service .js')
const jwt = require('jsonwebtoken');

const userRegister = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { userName, email, password } = req.body;
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            return next(new customError('User already exists', 400));
        }
        const user = await userModel.create({ userName, email, password });
        const token = await user.generateJWT();
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,          // true if using HTTPS; false on localhost
            sameSite: 'lax',        // or 'none' with secure: true for cross-site cookies
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        delete user._doc.password;
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user,
            token: token
        });
    } catch (error) {
        return next(new customError(error.message, 500));
    }
}

const userLogin = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return next(new customError('Invalid credentials', 401));
        }
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return next(new customError('Invalid credentials', 401));
        }
        const token = await user.generateJWT();
        // console.log("login ki token",token)
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,          // true if using HTTPS; false on localhost
            sameSite: 'Lax',        // or 'none' with secure: true for cross-site cookies
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        delete user._doc.password;
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: user,
            token: token
        });
    } catch (error) {
        return next(new customError(error.message, 500));

    }
}

const currentUser = async (req, res, next) => {
    const user = req.user
    console.log(user)
    res.status(200).json({
        success: true,
        data: user
    })
}

const userLogout = async (req, res, next) => {

    try {
        const token = req.cookies.token
        console.log("logout token", token)
        if (!token) return next(new customError("user not logged in", 400))

        const blackListToken = await cacheClient.set(
            token,
            "blacklisted",
            "EX",
            60 * 60 * 24
        )

        res.clearCookie("token");
        res.status(200).json({
            status: true,
            message: "user logged out successfully"
        })
    } catch (error) {
        return next(new customError(error.message, 400));
    }
}


const getAllUsers = async (req, res, next) => {
    try {
        const loggedInUser = req.user.email

        const user = await userModel.findOne({ email: loggedInUser });
        if (!user) {
            return next(new customError('User not found', 404));
        }

        const users = await userModel.find({ _id: { $ne: user._id } }).select('-password');
        if (!users) {
            return next(new customError('No users found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error) {
        return next(new customError(error.message, 400));
    }
}

const validateUser = async (req, res)=>{
  const token = req.cookies.token;
  console.log("validate token", token)
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded)
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("user", user)
    res.json({
      success: true,
      data:user
    });
  } catch (err) {
    console.log("Invalid token", err);
    return res.status(403).json({ error: "Invalid token" });
  }
}


module.exports = {
    userRegister,
    userLogin,
    currentUser,
    userLogout,
    getAllUsers,
    validateUser
}