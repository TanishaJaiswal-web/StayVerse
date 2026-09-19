const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const { storage }= require("../cloudConfig.js");
const upload = multer({ storage });





//show all listing and post listing route
router.route("/")
    .get(wrapAsync(listingController.showAllListings))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
           validateListing,
        wrapAsync(listingController.createNewListing));
 

//render new listing form route
router.get("/new",
    isLoggedIn,
    listingController.renderNewListingForm);


//show,edit,destroy listing route
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
         upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.editListing))
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing));


//render edit listing form route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditListingForm));
     

    // adding and removing wishlist route
    router.post("/:id/wishlist",
    isLoggedIn,
    wrapAsync(listingController.wishListAddRemove));

module.exports = router;