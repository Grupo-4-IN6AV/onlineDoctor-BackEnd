'use strict'

const mongoose = require('mongoose');
const previewPrescriptionSchema = mongoose.Schema(
{
    date: Date,
    pacient: {type: mongoose.Schema.ObjectId, ref : 'User'},
    doctor: {type: mongoose.Schema.ObjectId, ref : 'Doctor'},
    medicaments: [{ type: mongoose.Schema.ObjectId, ref : 'Medicament'}],
    laboratorys: [{type: mongoose.Schema.ObjectId, ref : 'Laboratory'}],
    description: String,
    AnotherMedicaments: String,
    AnotherLaboratories: String,
});

module.exports = mongoose.model('PreviewPrescription', previewPrescriptionSchema);