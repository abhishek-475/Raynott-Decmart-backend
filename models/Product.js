const mongoose = require('mongoose')


const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String
    },
    rating: {
        type: Number,
        default: 0
    },
    comment: {
        type: String
    }
}, { timestamps: true });


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    brand: {  
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    countInStock:{
        type: Number,
        default: 0
    },
    image:{
        type: String
    },
    category:{
        type: String
    },
    reviews:[reviewSchema],
    rating:{
        type: Number,
        default: 0
    },
    numReviews:{
        type: Number,
        default: 0
    }
},{timestamps: true})

module.exports = mongoose.model('Product', productSchema)