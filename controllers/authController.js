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

async function register(req,res) {
const {name,password,confirmpassword}=req.body
if(!name || !password || !confirmpassword)
return sendResponse(
    res,
    false,
    null,
    "Name and Password is required",
    400
)
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,30}$/;

  if (!passwordRegex.test(password)) {
    return sendResponse(
      res,
      false,
      null,
      "Password must be 8-30 chars, include uppercase, lowercase, number, and special character",
      400
    );
  }


if(confirmpassword !== password){
    return sendResponse(
        res,
        false,
        null,
        "Confirm password and password must be same",
        400
    )
}
const existinguser =await user.findOne({name:name})
console.log('existing user',existinguser);
// if(existinguser){
// return sendResponse
// }
if(existinguser){
    return sendResponse(
        res,
        false,
        null,
        "Name is already taken",
        400
    )
}
const hashpassword=await bcrypt.hash(password,10)
const newuser=await user.create({
    name:name,
    password:hashpassword
})
return sendResponse(
    res,
    true,
    null,
    "User registered",
    200
)

}
module.exports={login,register}