require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const { Server } = require("socket.io");
const routes = require("./routes/userRoutes");
const path = require("path");
const mongoose = require("mongoose");
const cookieparser = require("cookie-parser");
const authroutes = require("./routes/authroutes");
const { chats } = require("./models/userModel");

const server = http.createServer(app);

const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

const io = new Server(server);

const onlineUsers = {}; // { userId: socket.id }

io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);

    // User registers themselves after logging in
    socket.on("registerUser", (userId) => {
        onlineUsers[userId] = socket.id;
        console.log("Online users:", onlineUsers);
        io.emit("updateUserStatus", Object.keys(onlineUsers));
    });

    // Join Group Room
    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group room: ${groupId}`);
    });

    // Listen for messages
    socket.on("message", async (data) => {
        try {
            const { senderId, receiverId, groupId, message } = data;

            if (groupId) {
                // Group Message
                const chat = new chats({ sender: senderId, group: groupId, message });
                await chat.save();
                
                // Broadcast to everyone in the group room
                io.to(groupId).emit("message", { ...data, sender: senderId });
            } else {
                // One-on-One Message
                const chat = new chats({ sender: senderId, receiver: receiverId, message });
                await chat.save();

                const receiverSocketId = onlineUsers[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("message", data);
                }

                socket.emit("message", data);
                
                if (receiverSocketId) {
                    socket.to(receiverSocketId).emit("receiveNotification", data);
                }
            }
        } catch (error) {
            console.error("Error saving/sending message:", error);
        }
    });


    // Handle disconnect
    socket.on("disconnect", () => {
        // Remove disconnected user from onlineUsers
        for (let key in onlineUsers) {
            if (onlineUsers[key] === socket.id) delete onlineUsers[key];
        }
        io.emit("updateUserStatus", Object.keys(onlineUsers));
        console.log("User disconnected. Online users:", onlineUsers);
    });
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.static(path.resolve("./public")));
app.use(express.json());
app.use(cookieparser());


app.use(express.urlencoded({ extended: true }));

app.use("/", routes);
app.use("/auth", authroutes);

const PORT = process.env.PORT || 1002;
server.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
