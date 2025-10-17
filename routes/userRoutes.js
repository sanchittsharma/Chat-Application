const express=require("express")
const router=express.Router()
const {user,group}=require("../models/userModel")
const {login}=require("../controllers/authController")
const restrictUser=require("../middlewares/auth")
const sendResponse = require("../utils/sendresponse.utils")
const {loadchats,getmessage}=require("../controllers/userController")

router.get("/",async(req,res)=>{
     return res.render("loginpage")
    
})
router.get("/chats",restrictUser,loadchats)
router.get("/chats/:friendid",restrictUser,getmessage)

module.exports=router
