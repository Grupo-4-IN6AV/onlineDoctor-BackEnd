'use strict'

const express = require('express');
const prescriptionPDFController = require('../controllers/prescriptionControllerPDF');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/viewPrescriptionPDF/:id', prescriptionPDFController.savePDF);

module.exports = api;