const express=require("express")
const router=express.Router()
const {user,group}=require("../models/userModel")
const { login, register, forgotPassword } = require("../controllers/authController");
const restrictUser = require("../middlewares/auth");
const sendResponse = require("../utils/sendresponse.utils");
const { loadchats, getmessage } = require("../controllers/userController");
const { createGroup, getGroupMessages, getGroups } = require("../controllers/groupController");

router.get("/", async (req, res) => {
    return res.render("loginpage");
});


router.get("/chats", restrictUser, loadchats);
router.get("/chats/:friendid", restrictUser, getmessage);
router.get("/about", (req, res) => res.render("about"));


// Group Routes
router.post("/groups", restrictUser, createGroup);
router.get("/groups", restrictUser, getGroups);
router.get("/groups/:groupId/messages", restrictUser, getGroupMessages);

module.exports = router;

