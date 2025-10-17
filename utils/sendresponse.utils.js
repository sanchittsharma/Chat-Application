
// const activitylog=require("../models/logs.model")


function sendResponse(res,success,data,message,statuscode=200){
   

    return res.status(statuscode).json({
        success,
        data:data || null,
        message,
        statuscode

    })
}

module.exports=sendResponse