const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name: { type: String },
    admin: { type: String },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }]
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});



const group = mongoose.model("group", groupSchema);
const user = mongoose.model("user", userSchema);

const chatSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // For 1-on-1 chats
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" },   // For group chats
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chats = mongoose.model("chats", chatSchema);


module.exports = { user, group, chats };