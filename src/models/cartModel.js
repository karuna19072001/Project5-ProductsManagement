const mongoose = require('mongoose')


const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: 'userId is required',
        refs: "createUser",
        unique: true
    },
    items: [{
        _id: false,
        productId: {
            type: mongoose.Types.ObjectId,
            required: true,
            refs: "products"
        },
        quantity: {
            type: Number,
            //type : String,
            required: true,
            min: 1
        }
    }],
    totalPrice: {
        //type: Number,
        type: String,
        required: 'totalPrice is required',
        Comment: 'Holds total price of all the items in the cart'
    },
    totalItems: {
        //type: Number,
        type: String,
      //  required: 'totalItems are required',
        Comment: 'Holds total number of items in the cart'
    },
    totalQuantity:{
        //type: Number,
        type: String,
        required: 'totalQuantity are required',
        Comment: 'Holds total quantity in the cart',
        default: 0
    }, 
    isDeleted :{
        type: Boolean,
        default: false
    }, 
    deletedAt: {
        type: Date,
    }
}, { timestamps: true })


module.exports = mongoose.model('Cart', cartSchema, 'cart')