const express =require("express")
const http=require("http")
const app=express()
const  {Server}=require("socket.io")
const routes=require("./routes/userRoutes")
const path=require("path")
const mongoose=require("mongoose")
const cookieparser=require("cookie-parser")
const authroutes=require("./routes/authroutes")
const { chats } = require("./models/userModel")

const server= http.createServer(app)

// const connectWithRetry = () => {
//     const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/chatapp";
//     mongoose.connect(mongoUrl)
//       .then(() => console.log("MongoDB connected"))
//       .catch((err) => {
//         console.error("MongoDB connection failed, retrying in 5s...", err.message);
//         setTimeout(connectWithRetry, 5000);
//       });
//   };
  
//   connectWithRetry();

mongoose.connect("mongodb://127.0.0.1:27017/chatapp").then(
    console.log('mongodb connected')
    
)


const io=new Server(server)

const onlineUsers = {}; // { userId: socket.id }

io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);

    // User registers themselves after logging in
    socket.on("registerUser", (userId) => {
        onlineUsers[userId] = socket.id;
        console.log("Online users:", onlineUsers);
        // io.emit("userstatus",onlineUsers)
        io.emit("updateUserStatus", Object.keys(onlineUsers));
    });

    // Listen for messages
    socket.on("message", async (data) => {
        const { senderId, receiverId, message } = data;

        const chat = new chats({ sender: senderId, receiver: receiverId, message });
        await chat.save();
        
        
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("message", data);
        }
        
        socket.emit("message", data);
        socket.to(receiverSocketId).emit("receiveNotification", data);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        // Remove disconnected user from onlineUsers
        for (let key in onlineUsers) {
            if (onlineUsers[key] === socket.id) delete onlineUsers[key];
        }
        // io.emit("userstatus",onlineUsers)
        io.emit("updateUserStatus", Object.keys(onlineUsers));
        console.log("User disconnected. Online users:", onlineUsers);
    });
});
app.set("view engine", "ejs");

app.set("views", path.resolve("./views"));
app.use(cookieparser())
app.use(express.urlencoded({extended:true}))
app.use("/",routes)
app.use("/auth",authroutes)
server.listen(1002,()=>{
    console.log("server started at port 1002")
})