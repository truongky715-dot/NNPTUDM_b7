var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let jwt = require('jsonwebtoken')
const { body } = require('express-validator');
/* GET home page. */
//localhost:3000
router.post('/register', async function (req, res, next) {
    let newUser = await userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        "69a5462f086d74c9e772b804"
    )
    res.send(newUser._id)
});
router.post('/login', async function (req, res, next) {
    let result = await userController.QueryByUserNameAndPassword(
        req.body.username, req.body.password
    )
    console.log(result);
    res.send(result)
});
router.post('/check', function (req, res, next) {
    let result = jwt.verify(
        req.body.key, "a-string-secret-at-least-256-bits-long"
    )
    res.send(result)
})

module.exports = router;
