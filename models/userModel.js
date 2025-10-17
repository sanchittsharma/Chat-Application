const mongoose=require("mongoose")


const groupSchema= new mongoose.Schema({
    name:{type:String},
    admin:{
        type: String
    },
   users:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
   },
{
    name:{
        type:String
    }
}]
})


const userSchema= new mongoose.Schema({
    name:{
        type:String
    },
    password:{
        type:String
    }
})
const group=mongoose.model("group",groupSchema)

const user=mongoose.model("user",userSchema)

const chatSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  });

  const chats=mongoose.model("chats",chatSchema)
// user.create({
//     name:"sanchit",
//     password:"123",    
// })
// user.create({
//     name:"newuser",
//     password:"123",    
// })

module.exports={user,group,chats}