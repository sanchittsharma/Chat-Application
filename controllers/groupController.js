const { group, chats } = require("../models/userModel");
const sendResponse = require("../utils/sendresponse.utils");

async function createGroup(req, res) {
    try {
        const { name, members } = req.body;
        const admin = req.user._id;

        if (!name || !members || !Array.isArray(members)) {
            return sendResponse(res, false, null, "Group name and members are required", 400);
        }

        // Add admin to members if not already there
        if (!members.includes(admin.toString())) {
            members.push(admin.toString());
        }

        const newGroup = await group.create({
            name,
            admin: admin.toString(),
            users: members
        });

        return sendResponse(res, true, newGroup, "Group created successfully", 201);
    } catch (error) {
        console.error("Error creating group:", error);
        return sendResponse(res, false, null, "Error in group creation", 500);
    }
}

async function getGroupMessages(req, res) {
    try {
        const { groupId } = req.params;
        const messages = await chats.find({ group: groupId })
            .populate("sender", "name")
            .sort({ timestamp: 1 });

        return sendResponse(res, true, messages, "Group messages fetched", 200);
    } catch (error) {
        console.error("Error fetching group messages:", error);
        return sendResponse(res, false, null, "Error in fetching group messages", 500);
    }
}

async function getGroups(req, res) {
    try {
        const userId = req.user._id;
        const userGroups = await group.find({ users: userId });
        return sendResponse(res, true, userGroups, "Groups fetched", 200);
    } catch (error) {
        console.error("Error fetching groups:", error);
        return sendResponse(res, false, null, "Error in fetching groups", 500);
    }
}

module.exports = { createGroup, getGroupMessages, getGroups };
