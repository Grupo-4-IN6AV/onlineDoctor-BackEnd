'use strict'

const mongoose = require('mongoose');
const typeLaboratorySchema = mongoose.Schema({
    name: String,
    description: String
});

module.exports = mongoose.model('TypeLaboratory', typeLaboratorySchema);