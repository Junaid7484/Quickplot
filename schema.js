const Joi = require('joi');

const quickplotSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title is required'
    }),
    contact: Joi.number().integer().min(10).max(10).required().messages({
        'number.base': 'Contact must be a valid phone number'
    }),
    image: Joi.object({
        url: Joi.string().uri().required(),
        filename: Joi.string().required()
    }).required(),
    price: Joi.number().positive().required(),
    location: Joi.string().required()
});

module.exports = { quickplotSchema };