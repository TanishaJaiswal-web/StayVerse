const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateReview, isAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js");



// post review route
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.postReview));


// destroy review route
router.delete("/:reviewid",
    isLoggedIn,
    isAuthor,
    wrapAsync(reviewController.destroyReview));

module.exports = router;