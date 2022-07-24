'use strict'

const mongoose = require('mongoose');
const laboratorySchema = mongoose.Schema({
    typeLaboratory: {type: mongoose.Schema.ObjectId, ref : 'TypeLaboratory'},
    date: Date,
    specifications: String
});

module.exports = mongoose.model('Laboratory', laboratorySchema);