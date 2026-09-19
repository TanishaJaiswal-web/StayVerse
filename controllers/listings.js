const e = require("connect-flash");
const Listing = require("../models/listing.js")
const { getGeometry,
    calculateTrendingScore,
getCountryName } = require("./helperFunctions.js")
const { config, geocoding } = require("@maptiler/client");
config.apiKey = process.env.MAPTILER_API_KEY;



// show all listings
module.exports.showAllListings = async (req, res, next) => {

        let { query, category } = req.query;
        const filters = {};
        if (query) {
            const rawInput = query.split(",")[0].trim();
            if (rawInput) {
                const resolvedName = typeof getCountryName === "function" ? getCountryName(rawInput) : rawInput;
                const searchTerms = Array.isArray(resolvedName) 
                  ? [...resolvedName, rawInput] 
                  : [resolvedName, rawInput];
                const uniqueTerms = [...new Set(searchTerms)];
                const pattern = uniqueTerms
                  .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                  .join("|");
                const searchRegex = new RegExp(pattern, "i");
                filters.$or = [
                  { location: searchRegex },
                  { country: searchRegex },
                  { title: searchRegex }
                ];
            }
        }
        if (category) {
            filters.category = { $in: Array.isArray(category) ? category : [category] };
        }
        let allListings = [];
        if (category && (Array.isArray(category) ? category.includes("Trending") : category === "Trending")) {
            allListings = await Listing.find({
                $and: [filters, { trending: true }]
            })
            .sort({ trendingScore: -1, _id: -1 })
            .limit(10);
        } else {
            allListings = await Listing.find(filters);
        }
        const isAjax = req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest";
        const isSearchingOrFiltering = Boolean(query || category);

        if (allListings.length === 0) {
            if (isAjax){
                return res.json({ success: false, message: "No Results Found", allListings: [] });
            }
            if (isSearchingOrFiltering) {
                req.flash("error", "No Results Found");
            }
            return res.render("listings/index", { allListings: [] });
        }
        if (isAjax) {
            return res.render("includes/allListings", { allListings });
        }
        
        res.render("listings/index", { allListings });
    
    }



// render new  listing form 
module.exports.renderNewListingForm = (req, res) => {
    res.render("listings/new.ejs")
};


//create new listing 
module.exports.createNewListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.image = { url, filename };
    listing.geometry = await getGeometry(req.body.listing.location.trim(), req.body.listing.country.trim());
    const newListing = await listing.save();

    req.flash("success", "New Listing Created");
    res.redirect(`/listings/${newListing._id}`);
};

//show listing 
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner")

    if (!listing) {
        req.flash("error", "Listing You Requested For Does Not Exist");
        return res.redirect("/listings")
    } else {
       await calculateTrendingScore(listing);
        if (listing.wishlistHistory && Array.isArray(listing.wishlistHistory)) {
            listing.wishlistHistory = listing.wishlistHistory.filter(Boolean);
        }
        res.render("listings/show.ejs", { listing });
    }
};

//render edit listing  form 
module.exports.renderEditListingForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing You Requested For Does Not Exist");
        res.redirect("/listings")
    } else {
        res.render("listings/edit.ejs", { listing });
    }

};

//update listing 
module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    listing.geometry = await getGeometry(req.body.listing.location.trim(), req.body.listing.country.trim());
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };

    }
    await listing.save();
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

//destroy  listing 
module.exports.destroyListing = async (req, res) => {

    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};


// adding and removing wishlist 
module.exports.wishListAddRemove = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({
            success: false,
            isWishlisted: false,
            message: "Listing You Requested For Does Not Exist"
        });
    }
    const today = new Date();
    const user = req.user._id;

    // Check if user is currently wishlisted
    const userIndex = listing.wishlistUsers.findIndex(
        id => id.toString() === user.toString()
    );

    // USER ALREADY WISHLISTED → REMOVE
    if (userIndex !== -1) {
        listing.wishlistUsers.pull(user);
        listing.wishlist--;
        await listing.save();
        return res.status(200).json({
            success: true,
            isWishlisted: false,
            message: "wishlist removed"
        });
    }

    // User is NOT wishlisted 
    const latestHistory = listing.wishlistHistory.at(-1);
    // Check whether today's history already exists
    const isSameDay =
        latestHistory &&
        latestHistory.wishListedAt.getDate() === today.getDate() &&
        latestHistory.wishListedAt.getMonth() === today.getMonth() &&
        latestHistory.wishListedAt.getFullYear() === today.getFullYear();

    // Add user to current wishlist
    listing.wishlistUsers.push(user);
    listing.wishlist++;

    // Update wishlist history
    if (isSameDay) {

        latestHistory.count++;

    } else {

        listing.wishlistHistory.push({
            wishListedAt: today,
            count: 1
        });
    }

    listing.lastWishListedAt = today;

    await listing.save();

    return res.status(200).json({
        success: true,
        isWishlisted: true,
        message: "wishlist added"
    });
};



