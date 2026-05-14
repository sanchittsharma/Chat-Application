const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/sendresponse.utils");
const { user } = require("../models/userModel");

async function restrictUser(req, res, next) {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.redirect("/");
        }

        const key = process.env.JWT_SECRET || 'abc@abc';
        const decoded = jwt.verify(token, key);

        if (!decoded || !decoded.name) {
            return res.redirect("/");
        }

        const currentUser = await user.findOne({ name: decoded.name });

        if (!currentUser) {
            return sendResponse(res, false, null, "No user found", 401);
        }

        req.user = currentUser;
        next();
    } catch (error) {
        console.log("JWT error:", error);
        if (error.name === "TokenExpiredError") {
            return res.redirect("/");
        }
        return sendResponse(res, false, null, "Error in JWT auth", 401);
    }
}

module.exports = restrictUser;