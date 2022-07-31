'use strict'

const express = require('express');
const previewPrescriptionController = require('../controllers/previewPrescription.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/test',previewPrescriptionController.previewPrescriptionTest);

//Rutas Privadas//
api.get('/getPreviewPrescriptions', [mdAuth.ensureAuth], previewPrescriptionController.getPrescriptionsADMIN);
//FUNCIONES DE DOCTOR///
api.post('/savePreviewPrescription', [mdAuth.ensureAuth], previewPrescriptionController.savePrescriptoionADMIN);
api.post('/addMedicament/:id', [mdAuth.ensureAuth], previewPrescriptionController.addMedicamento);
api.post('/addLaboratory/:id', [mdAuth.ensureAuth], previewPrescriptionController.addLaboratory);
api.post('/deleteMedicament/:id', [mdAuth.ensureAuth], previewPrescriptionController.deleteMedicament);
api.post('/deleteLaboratory/:id', [mdAuth.ensureAuth], previewPrescriptionController.deleteLaboratory);
api.put('/updatePreviewPrescription/:id', [mdAuth.ensureAuth], previewPrescriptionController.updatePrescription);
api.delete('/deletePreviewPrescription/:id/:idUser', [mdAuth.ensureAuth], previewPrescriptionController.deletePrescriptionADMIN);
api.get('/getPreviewPrescriptionsDoctor/:id', [mdAuth.ensureAuth], previewPrescriptionController.getPrescriptionsUSER);
api.get('/getPreviewPrescription/:id', [mdAuth.ensureAuth], previewPrescriptionController.getprescriptionADMIN);
api.get('/getMedicamentsOutPrescription/:idPrescription', previewPrescriptionController.getMedicamentsOutPrescription);
api.get('/getLaboratorysOutPrescription/:idPrescription', previewPrescriptionController.getLaboratorysOutPrescription);

module.exports = api;