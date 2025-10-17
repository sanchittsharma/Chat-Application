const jwt=require("jsonwebtoken")
const sendResponse = require("../utils/sendresponse.utils")
const {user}= require("../models/userModel")
const key ='abc@abc'

async function restrictUser(req, res, next) {
    try {
      const token = req.cookies?.token;
  
      if (!token) {
       return res.redirect("/")
        // return sendResponse(res, false, null, "User not logged in", 401);
      }
     
      const decoded = jwt.verify(token, key);
      // console.log("Decoded JWT:", decoded);
  
      if (!decoded || !decoded.name) {
       return res.redirect("/")
        // return sendResponse(res, false, null, "Invalid token payload", 401);
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
        
        return res.redirect("/")
    }
      return sendResponse(res, false, null, "Error in JWT auth", 401);
    }
  }

module.exports=restrictUser