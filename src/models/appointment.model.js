'use strict'

const mongoose = require('mongoose');
const appointmentSchema = mongoose.Schema({
    pacient: {type: mongoose.Schema.ObjectId, ref : 'User'},
    doctor: {type: mongoose.Schema.ObjectId, ref : 'Doctor'},
    date: Date,
    modality: String,
});

module.exports = mongoose.model('Appointment', appointmentSchema);