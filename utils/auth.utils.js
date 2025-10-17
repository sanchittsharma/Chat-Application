const jwt=require("jsonwebtoken")
const {user}=require("../models/userModel")
const sendResponse = require("./sendresponse.utils")
const key='abc@abc'
function setUser(users) {
       return jwt.sign(
      {
        
        name: users.name,
      },
      key,
      { expiresIn: "1h" } // optional expiry
    );
  }


module.exports=setUser