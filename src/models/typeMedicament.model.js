'use strict'

const mongoose = require('mongoose');
const TypeMedicamentSchema = mongoose.Schema({
    name: String,
    description: String
});

module.exports = mongoose.model('TypeMedicament', TypeMedicamentSchema);