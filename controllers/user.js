const User = require("../models/user.js");


// render signup user form
module.exports.signup = (req, res) => {
    res.render("./users/signUp.ejs")
};

// create user
module.exports.createUser = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        let user = new User({
            email: email,
            username: username
        });
        await User.register(user, password);
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to StayVerse");
            res.redirect("/listings");
        })
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

// render login form
module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
};

// login user
module.exports.login = async (req, res) => {
       req.flash("success", "Welcome back to StayVerse!")
    const redirectUrl = res.locals.redirectUrl || '/listings';

       if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
        return req.session.save((err) => {
            if (err) return next(err);
            return res.status(200).json({
                success: true,
                message: "Welcome back to StayVerse!",
                redirectUrl: redirectUrl
            });
        });
    }
 
    res.redirect(redirectUrl);
};

//   logout user
module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};