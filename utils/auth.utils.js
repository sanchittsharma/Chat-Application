const jwt = require("jsonwebtoken");

function setUser(user) {
    const key = process.env.JWT_SECRET || "abc@abc";
    return jwt.sign(
        {
            name: user.name,
        },
        key,
        { expiresIn: "1h" }
    );
}

module.exports = setUser;