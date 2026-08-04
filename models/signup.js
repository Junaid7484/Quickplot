const mongoose = require('mongoose');
const Quickplot = require('./sample');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;

const signupSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    number: {
        type: Number,
        required: true,
        unique: true
    },
    email_id: {
        type: String,
        required: true, 
        unique: true
    },
    
})

signupSchema.post("findOneAndDelete", async(signup)=> {
    if(signup){
        await Quickplot.deleteMany({owner: signup._id})
    }
})

signupSchema.plugin(passportLocalMongoose);
const Signup = new mongoose.model("signup", signupSchema);

module.exports = Signup