let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken');
module.exports = {
    CreateAnUser: async function (username, password, email, role,
        avatarUrl, fullName, status, loginCount
    ) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            avatarUrl: avatarUrl,
            fullName: fullName,
            status: status,
            loginCount: loginCount
        })
        await newUser.save();
        return newUser;
    },
    QueryByUserNameAndPassword: async function (username, password) {
        let getUser = await userModel.findOne({ username: username });
        if (!getUser) {
            return false;
        } else {
            let result = bcrypt.compareSync(password, getUser.password);
            if (result) {
                return jwt.sign(
                    { id: result._id }, "a-string-secret-at-least-256-bits-long"
                )
            } else {
                return false
            }
        }
    }
}