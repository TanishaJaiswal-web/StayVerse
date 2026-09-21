
if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

// ipv6 was timing out so used undici to forcefully use ipv4
const { Agent, setGlobalDispatcher } = require("undici");  

setGlobalDispatcher(new Agent({
    connect: { family: 4 }
}));


const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const listingsRouter= require("./routes/listing.js");
const reviewsRouter= require("./routes/review.js");
const usersRouter= require("./routes/user.js");
const footerRouter= require("./routes/footer.js");
const session =require("express-session");
const {MongoStore,createWebCryptoAdapter} = require('connect-mongo');
const flash= require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local")
const User=require("./models/user.js");
const ExpressError= require("./utils/ExpressError.js")


const app = express();


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine('ejs', engine);



const dbURL =process.env.MONGODB_URL;
const store=  MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 3600,
  cryptoAdapter: createWebCryptoAdapter({
    secret: process.env.SECRET,
  }),

});

store.on("error",()=>{
    console.log("Mongo Session Store Error, err")
});

const sessionOptions={
    
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});



// const MONGO_URL = 'mongodb://127.0.0.1:27017/StayVerse';

main().then((res) => {
    console.log(" database connect success");
}).catch((err) => {
    console.log(err);
})


async function main() {
    await mongoose.connect(dbURL);
};



app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",usersRouter);
app.use("/",footerRouter);


app.use((req, res, next) => {
    next(new ExpressError(404, "error 404! Page Not Found"));
});

app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    res.status(status).render("error.ejs",{message,status})
});

app.listen(3000, () => {
    console.log("app is listening on port 3000");
});