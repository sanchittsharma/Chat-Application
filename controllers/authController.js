const { name } = require("ejs")
const {user}=require("../models/userModel")
const { use } = require("../routes/userRoutes")
const sendResponse=require("../utils/sendresponse.utils")
const jwt=require("jsonwebtoken")
const key='abc@abc'
const setUser=require("../utils/auth.utils")

const bcrypt=require("bcrypt")
async function login(req,res) {
    // console.log(req.body);
    
    const {name,password}=req.body
    if(!name || !password)
    {
   return sendResponse(
    res,
    false,
    null,
    "Mail and pass required",
    400
   )
}
const users=await user.findOne({name:name})

   if(!users){
    return sendResponse(
        res,
        false,
        null,
        "no user",
        401
    )
   }
   const hashpassword=await bcrypt.compare(password,users.password)
   console.log('hashes',hashpassword);
   
   if(!hashpassword){
    return sendResponse(
        res,
        false,
        null,
        "Invalid credentials",
        401
    )
   }
const token= setUser(users)
res.cookie("token",token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  })

   return sendResponse(
    res,
    true,
    null,
    "Login Successfull",
    200
   )
    
}

const crypto = require("crypto");
const sendEmail = require("../utils/email.utils");

async function register(req, res) {
    const { name, email, password, confirmpassword } = req.body;
    if (!name || !email || !password || !confirmpassword) {
        return sendResponse(res, false, null, "All fields are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return sendResponse(res, false, null, "Invalid email format", 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,30}$/;
    if (!passwordRegex.test(password)) {
        return sendResponse(res, false, null, "Password must be 8-30 chars, include uppercase, lowercase, number, and special character", 400);
    }

    if (confirmpassword !== password) {
        return sendResponse(res, false, null, "Passwords do not match", 400);
    }

    const existingUser = await user.findOne({ $or: [{ name }, { email }] });
    if (existingUser) {
        return sendResponse(res, false, null, "Username or Email already taken", 400);
    }

    const hashpassword = await bcrypt.hash(password, 10);
    await user.create({ name, email, password: hashpassword });
    
    return sendResponse(res, true, null, "User registered successfully", 200);
}

async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
        return sendResponse(res, false, null, "Email is required", 400);
    }

    const foundUser = await user.findOne({ email });
    if (!foundUser) {
        return sendResponse(res, false, null, "No account with that email exists", 404);
    }

    // Create a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token and set to resetPasswordToken field
    foundUser.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    foundUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await foundUser.save();

    // Reset URL
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a POST request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: foundUser.email,
            subject: "Password Reset Token",
            message,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
                    <h2 style="color: #1e293b;">Password Reset Request</h2>
                    <p style="color: #475569;">You requested a password reset for your Connect Chat account. Click the button below to reset it. This link is valid for 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
                    <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        });

        return sendResponse(res, true, null, "Reset link sent to email", 200);
    } catch (err) {
        console.error("Email error:", err);
        foundUser.resetPasswordToken = undefined;
        foundUser.resetPasswordExpires = undefined;
        await foundUser.save();
        return sendResponse(res, false, null, "Email could not be sent", 500);
    }
}

async function resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return sendResponse(res, false, null, "New password is required", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const foundUser = await user.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!foundUser) {
        return sendResponse(res, false, null, "Invalid or expired token", 400);
    }

    // Set new password
    const hashpassword = await bcrypt.hash(password, 10);
    foundUser.password = hashpassword;
    foundUser.resetPasswordToken = undefined;
    foundUser.resetPasswordExpires = undefined;
    await foundUser.save();

    return sendResponse(res, true, null, "Password reset successful", 200);
}

module.exports = { login, register, forgotPassword, resetPassword };
