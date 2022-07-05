'use strict'

const mongoose = require('mongoose');
const doctorSchema = mongoose.Schema({
    name: String,
    surname: String,
    username: String,
    DPI: String,
    email: String,
    phone: String,
    password: String,
    age: String,
    gender: String,
    role: 'DOCTOR',
    collegiateNumber: String,
    specialty:[{type: mongoose.Schema.ObjectId, ref : 'Specialty'}],
    appointment:[{type: mongoose.Schema.ObjectId, ref : 'Appointment'}]
});

module.exports = mongoose.model('Doctor', doctorSchema);