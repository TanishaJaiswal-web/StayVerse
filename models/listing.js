const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { ref } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    url: String,
    filename: String

  },
  price: {
    type: Number
  },
  location: {
    type: String
  },
  country: {
    type: String
  },
  reviews: [

    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],

    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  category: {
    type: [String],
    enum: ['Trending', 'Iconic Cities', 'Rooms', 'Mountains', 'Heritage', 'Castle', 'Beaches', 'Arctic', 'Lake Front', 'Tiny Homes', 'Vineyards & Tasting', 'Pools & Swimming', 'Skiing & Snow', 'Hiking & Trails']
  },
  views: {
    type: Number,
    default: 0
  },
  viewsHistory: [{
    _id: false,
    viewedAt: {
      type: Date,
      default: null
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  lastViewedAt: {
    type: Date,
    default: null
  },
  trending: {
    type: Boolean,
    default: false
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  wishlist: {
    type: Number,
    default: 0
  },
  wishlistUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  wishlistHistory: [{
    _id: false,
    wishListedAt: {
      type: Date,
      default: null
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  lastWishListedAt: {
    type: Date,
    default: null
  }
});

listingSchema.post("findOneAndDelete", async function (listing) {
  await Review.deleteMany({ _id: { $in: listing.reviews } });
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;


