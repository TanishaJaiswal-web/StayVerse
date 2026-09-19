const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware');
const userController = require("../controllers/user.js")


//signup and create user route
router.route("/signup")
    .get(userController.signup)
    .post(wrapAsync(userController.createUser));


// render login form and login user route
router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
        userController.login);


//   logout user route
router.get("/logout", userController.logout);


module.exports = router;