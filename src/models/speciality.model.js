'use strict'

const mongoose = require('mongoose');
const specialtySchema = mongoose.Schema({
    name: String,
    description: String
});

module.exports = mongoose.model('Speciality', specialtySchema);