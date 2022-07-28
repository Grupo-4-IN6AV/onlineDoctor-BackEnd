'use strict'

const mongoose = require('mongoose');

const shoppingCartSchema = mongoose.Schema(
{
    client: {type: mongoose.Schema.ObjectId, ref : 'User'},
    medicament: 
    [{
        medicament: {type:mongoose.Schema.ObjectId, ref: 'Medicament'},
        quantity: Number,
        price: Number,
        subTotalProduct: Number
    }],
    laboratorys:
    [{
        laboratory: {type:mongoose.Schema.ObjectId, ref: 'Laboratory'},
        subTotalLaboratory: Number
    }],
    IVA: Number,
    subTotal: Number,
    total: Number,
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);