'use strict'

const mongoose = require('mongoose');
const laboratorySchema = mongoose.Schema({
    pacient: {type: mongoose.Schema.ObjectId, ref : 'User'},
    typeLaboratory: {type: mongoose.Schema.ObjectId, ref : 'TypeLaboratory'},
    date: Date,
    specifications: String
});

module.exports = mongoose.model('Laboratory', laboratorySchema);