'use strict'

const mongoose = require('mongoose');
const prescriptionSchema = mongoose.Schema({
    pacient: {type: mongoose.Schema.ObjectId, ref : 'User'},
    doctor: {type: mongoose.Schema.ObjectId, ref : 'Doctor'},
    medicament: 
    [
        {
            name: String,
            description: String,
            medicament: {type: mongoose.Schema.ObjectId, ref : 'Medicament'}
        }
    ],
    laboratory: 
    [
        {
            name: String,
            description: String,
            laboratory: {type: mongoose.Schema.ObjectId, ref : 'Laboratory'}
        }
    ],
    description: String,
    dateIssue: Date,
    status: String,
});

module.exports = mongoose.model('Prescription', prescriptionSchema);