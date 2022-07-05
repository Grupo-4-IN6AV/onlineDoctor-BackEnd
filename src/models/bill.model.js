'use strict'

const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
{
    date: Date,
    client: {type: mongoose.Schema.ObjectId, ref : 'User'},
    numberBill: String,
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

module.exports = mongoose.model('Bill', billSchema);