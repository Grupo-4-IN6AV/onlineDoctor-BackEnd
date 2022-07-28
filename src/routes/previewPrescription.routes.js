'use strict'

const express = require('express');
const previewPrescriptionController = require('../controllers/previewPrescription.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/test',previewPrescriptionController.previewPrescriptionTest);

//Rutas Privadas//
api.post('/savePreviewPrescription', previewPrescriptionController.savePrescriptoionADMIN);

module.exports = api;