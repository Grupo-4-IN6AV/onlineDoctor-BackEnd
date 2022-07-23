'use strict'

const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: String,
    surname: String,
    username: String,
    DPI: String,
    NIT: String,
    email: String,
    phone: String,
    password: String,
    age: String,
    gender: String,
    role: String,
    personalAntecedent:
    [
        { 
            typeBlood: String,
            actualDiseases: 
            [
                {
                    name: String,
                    description: String,
                }
            ],
            habits:
            [
                {
                    alcohol: Boolean,
                    drugs:
                    [
                        {
                            name:String
                        }
                    ],
                    alimentation: String,
                    sleep: String,
                }
            ]
        } 
    ],
    familyAntecedent:
    [
        {
            diseasesMother:
            [
                {
                    name: String,
                    description: String,
                }
            ],
            diseasesFather:
            [
                {
                    name: String,
                    description: String,
                }
            ]
        }
    ],
    prescription: [{type: mongoose.Schema.ObjectId, ref : 'Prescription'}],
    laboratory: 
    [
        {
            laboratory: {type: mongoose.Schema.ObjectId, ref : 'Laboratory'},
            done: Boolean,
            description: String 
        }
    ],
    appointment:
    [
        {
            appointment: {type: mongoose.Schema.ObjectId, ref : 'Appointment'},
            done: Boolean
        }     
    ]
});

module.exports = mongoose.model('User', userSchema);