'use strict'

const mongoose = require('mongoose');

const shoppingCartSchema = mongoose.Schema(
{
    client: {type: mongoose.Schema.ObjectId, ref : 'User'},
    products: 
    [{
            medicament: {type:mongoose.Schema.ObjectId, ref: 'Medicament'}, 
            quantity: Number,
            price: Number,
            subTotalProduct: Number
    }],
    IVA: Number,
    subTotal: Number,
    total: Number,
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);