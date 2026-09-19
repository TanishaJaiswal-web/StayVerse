const Joi = require('joi');
const review = require('./models/review');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
         title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().allow("", null),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        ).optional()
    }).required()
});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().min(0).max(5),
        comment:Joi.string()
    }).required()
});
