'use strict'

const mongoose = require('mongoose');

const shoppingCartSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        client: String,
        NIT: String,
        medicaments:
            [{
                medicament: 
                { 
                    type: mongoose.Schema.ObjectId, ref: 'Medicament' 
                },
                quantity: Number,
                price: Number,
                subTotalMedicament: Number
            }],
        IVA: Number,
        subTotal: Number,
        total: Number,
    });

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema)