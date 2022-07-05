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
                            name:string
                        }
                    ],
                    alimentation: string,
                    sleep: string,
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
                    name: string,
                    description: string,
                }
            ],
            diseasesFather:
            [
                {
                    name: string,
                    description: string,
                }
            ]
        }
    ],
    prescription: [{type: mongoose.Schema.ObjectId, ref : 'Prescription'}],
    laboratory: 
    [
        {
            type: mongoose.Schema.ObjectId, ref : 'Laboratory',
            done: Boolean,
            description: String 
        }
    ],
    appointment:[{type: mongoose.Schema.ObjectId, ref : 'Appointment'}]
});

module.exports = mongoose.model('User', userSchema);