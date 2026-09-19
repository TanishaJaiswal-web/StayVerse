const wrapAsync = require("./utils/wrapAsync");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");

//  checking if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You Must Be Logged In First");

        if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
             req.session.redirectUrl = `/listings/${req.params.id}`; 
            return req.session.save((err) => {
                if (err) return next(err);
                return res.status(401).json({ 
                    success: false, 
                    redirectUrl: "/login" 
                });
            });
        }

         req.session.redirectUrl = req.originalUrl;
        return res.redirect("/login");
    }
    next();
};




// saving original requested url
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl ;
  }
  next();
};

// checking listing owner
module.exports.isOwner= wrapAsync(async(req,res,next)=>{
    let { id } = req.params ;
    let listing = await Listing.findById(id);
    if(!res.locals.currUser._id.equals(listing.owner._id)){
       req.flash("error","You Dont Have Permission");
     return res.redirect(`/listings/${id}`);
    }
   next();

});

// validate listing
module.exports.validateListing=(req,res,next)=>{
    const {error}=listingSchema.validate(req.body);
    if(error){
    const errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
    };

        // validate review
    module.exports.validateReview=(req,res,next)=>{
        const {error}=reviewSchema.validate(req.body);
        if(error){
        const errMsg=error.details.map((el)=>el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
        }

        // checking review author
module.exports.isAuthor= wrapAsync(async(req,res,next)=>{
    let { id,reviewid } = req.params ;
    let review = await Review.findById(reviewid);
    if(!res.locals.currUser._id.equals(review.author._id)){
       req.flash("error","You Dont Have Permission");
     return res.redirect(`/listings/${id}`);
    }
   next();

});

