// Get geometry of location
const { config, geocoding } = require("@maptiler/client");
// Set MapTiler API Key
config.apiKey = process.env.MAPTILER_API_KEY;
module.exports.getGeometry = async (location, country) => {
    config.apiKey = process.env.MAPTILER_API_KEY;
    const searchLocation = `${location}, ${country}`;
    const result = await geocoding.forward(searchLocation);
    if (result && result.features && result.features.length > 0) {
        return result.features[0].geometry;
    }
    return null;
};


//  Calculate views from last 10 days
const last10DaysAgoViews = (listing) => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    return (listing.viewsHistory || []).reduce((total, view) => {
        if (new Date(view.viewedAt) >= tenDaysAgo) {
            total += view.count;
        }
        return total;
    }, 0);
};

// Calculate wishlists from last 10 days
const last10DaysAgoWishlist = (listing) => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    return (listing.wishlistHistory || []).reduce((total, wishlist) => {
        if (new Date(wishlist.wishListedAt) >= tenDaysAgo) {
            total += wishlist.count;
        }
        return total;
    }, 0);
};

//Calculate trending score and make listing trending
module.exports.calculateTrendingScore = async (listing) => {
    const today = new Date();
    let hoursAgo = 0;

    if (listing.lastViewedAt) {
        hoursAgo = (today.getTime() - new Date(listing.lastViewedAt).getTime()) / (1000 * 60 * 60);
    }

    const recency = Math.max(0, 100 - hoursAgo);
    listing.views = (listing.views || 0) + 1;
    listing.lastViewedAt = today;

    if (!listing.viewsHistory) {
        listing.viewsHistory = [];
    }

    const latestView = listing.viewsHistory.at(-1);

    if (
        !latestView ||
        new Date(latestView.viewedAt).getDate() !== today.getDate() ||
        new Date(latestView.viewedAt).getMonth() !== today.getMonth() ||
        new Date(latestView.viewedAt).getFullYear() !== today.getFullYear()
    ) {
        listing.viewsHistory.push({
            viewedAt: today,
            count: 1
        });
    } else {
        latestView.count++;
        listing.markModified("viewsHistory"); 
    }

    const recentViews = last10DaysAgoViews(listing);
    const recentWishlists = last10DaysAgoWishlist(listing);

    listing.trendingScore = recentViews + recency + recentWishlists;

    if (recentViews >= 5 && recentWishlists >= 5 && listing.trendingScore >= 50) {
        if (!listing.category.includes("Trending")) {
            listing.category.push("Trending");
        }
    } else {
        listing.category.pull("Trending");
    }

    return await listing.save();

};


// Get Country Name
const countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

module.exports.getCountryName=(input)=> {
  if (!input) return "";

  const code = input.trim().toUpperCase();
  const result = countries.getName(code, "en", { select: "all" });

  return result || input;
}
