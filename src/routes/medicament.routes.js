'use strict'

const express = require('express');
const medicamentController = require('../controllers/medicament.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Implementación de Imágenes//
const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({uploadDir:'./uploads/medicaments'});


//Rutas Públicas//
api.get('/testMedicament', medicamentController.medicamentTest);

//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveMedicament', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.saveMedicamentADMIN);
api.put('/updateMedicament/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.updateMedicamentADMIN);
api.delete('/deleteMedicament/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.deleteMedicamentADMIN);
api.get('/getMedicaments', medicamentController.getMedicaments);
api.get('/getMedicament/:id', medicamentController.getMedicamentADMIN);
api.post('/getMedicamentByName', medicamentController.getMedicamentsByName);

api.get('/getMedicamentAtoZ', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.getMedicamentsAtoZ);
api.get('/getMedicamentZtoA', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.getMedicamentsZtoA);

//Rutas de Imágenes//
api.post('/uploadImageMedicament/:id', [mdAuth.ensureAuth, upload], medicamentController.addImageMedicament);
api.get('/getImageMedicament/:fileName',  upload, medicamentController.getImageMedicament);


module.exports = api;