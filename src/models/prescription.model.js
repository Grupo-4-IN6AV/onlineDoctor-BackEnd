'use strict'

const mongoose = require('mongoose');
const prescriptionSchema = mongoose.Schema({
    pacient: {type: mongoose.Schema.ObjectId, ref : 'User'},
    doctor: {type: mongoose.Schema.ObjectId, ref : 'Doctor'},
    medicament: 
    [{type: mongoose.Schema.ObjectId, ref : 'Medicament'}],
    laboratory: [{type: mongoose.Schema.ObjectId, ref : 'Laboratory'}],
    description: String,
    AnotherMedicaments: String,
    AnotherLaboratories: String,
    dateIssue: Date
});

module.exports = mongoose.model('Prescription', prescriptionSchema);