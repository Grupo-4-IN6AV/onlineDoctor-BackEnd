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
    role: String,
    collegiateNumber: String,
    specialty: { type: mongoose.Schema.ObjectId, ref: 'Speciality' },
    appointment:
        [
            {
                appointment: { type: mongoose.Schema.ObjectId, ref: 'Appointment' },
                done: Boolean
            }
        ],
    image: String,
});

module.exports = mongoose.model('Doctor', doctorSchema);