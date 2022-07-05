'use strict'

const mongoose = require('mongoose');
const laboratorySchema = mongoose.Schema({
    typeLaboratoy: {type: mongoose.Schema.ObjectId, ref : 'TypeLaboratory'},
    date: Date,
    specifications:
    [
        {
            description: String
        }
    ]
});

module.exports = mongoose.model('Laboratory', laboratorySchema);