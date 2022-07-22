'use strict'

const express = require('express');
const prescriptionController = require('../controllers/prescription.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testPrescription', prescriptionController.prescriptionTest);

//Rutas Privadas -ADMINISTRADOR-//
api.post('/savePrescription', [mdAuth.ensureAuth, mdAuth.isAdmin], prescriptionController.savePrescriptoionADMIN);
api.put('/updatePrescription/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], prescriptionController.updatePrescriptionADMIN);


module.exports = api;