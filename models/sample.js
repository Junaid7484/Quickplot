const mongoose = require('mongoose');
const { type } = require('node:os');

const quickplotSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    contact: {
        type: Number,
    },
    name: {
        type: String
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "signup",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
    },
        coordinates: {
            type: [Number],
            required: true
     }
    }

})



const Quickplot = mongoose.model("quickplots", quickplotSchema);

module.exports = Quickplot;