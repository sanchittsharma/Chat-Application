const {user,chats}=require("../models/userModel")
const sendresponse=require("../utils/sendresponse.utils")
async function loadchats(req, res) {
    const userid = req.user._id;
    const username = req.user.name;
    const allusers = await user.find({ _id: { $ne: userid } });

    return res.render("chats", { allusers, userid, username });
}


async function getmessage(req,res) {
    const friendId=req.params.friendid
    const user=req.user._id
    try {
        const messages = await chats.find({
            $or: [
                { sender: user, receiver: friendId },
                { sender: friendId, receiver: user }
            ]
        }).sort({ timestamp: 1 });

        return sendresponse(
            res,
            true,
            messages,
            "messages fetched",
            200
        )
    } catch (err) {
        console.error(err);
       return sendresponse(
        res,
        false,
        null,
        "error in fetching messages",
        400
       )
    }
    
}

module.exports={loadchats,getmessage}