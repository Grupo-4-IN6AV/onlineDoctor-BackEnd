'use strict'

const express = require('express');
const medicamentController = require('../controllers/medicament.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testMedicament', medicamentController.medicamentTest);

//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveMedicament', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.saveMedicamentADMIN);
api.put('/updateMedicament/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.updateMedicamentADMIN);
api.delete('/deleteMedicament/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.deleteMedicamentADMIN);
api.get('/getMedicaments', medicamentController.getMedicaments);
api.get('/getMedicament/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], medicamentController.getMedicamentADMIN);


module.exports = api;