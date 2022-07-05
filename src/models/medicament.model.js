'use strict'

const mongoose = require('mongoose');
const medicamentsSchema = mongoose.Schema({
    name: String,
    description: String,
    typeMedicament: {type: mongoose.Schema.ObjectId, ref : 'TypeMedicament'},
    price: Number,
    stock: Number,
    sales: Number,
    availibility: Boolean,
    photos: [{image:String}]
});

module.exports = mongoose.model('Medicament', medicamentsSchema);