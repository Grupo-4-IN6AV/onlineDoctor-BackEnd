'use strict'

const mongoose = require('mongoose');
const prescriptionSchema = mongoose.Schema({
    pacient: {type: mongoose.Schema.ObjectId, ref : 'User'},
    doctor: {type: mongoose.Schema.ObjectId, ref : 'Doctor'},
    medicament: 
    [
        {
            name: String,
            description: String
        }
    ],
    laboratory: 
    [
        {
            name: String,
            description: String
        }
    ],
    dateIssue: Date,
});

module.exports = mongoose.model('Prescription', prescriptionSchema);