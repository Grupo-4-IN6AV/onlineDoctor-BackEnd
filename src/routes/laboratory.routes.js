'use strict'

const express = require('express');
const laboratoryController = require('../controllers/laboratory.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testLaboratory', laboratoryController.laboratoryTest);

//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveLaboratory', [mdAuth.ensureAuth, mdAuth.isAdmin], laboratoryController.saveLaboratoryADMIN);
api.get('/getLaboratories', [mdAuth.ensureAuth, mdAuth.isAdmin], laboratoryController.getLaboratoriesADMIN);
api.get('/getLaboratory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], laboratoryController.getLaboratoryADMIN);
api.put('/updateLaboratory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], laboratoryController.updateLaboratoryADMIN);
api.delete('/deleteLaboratory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], laboratoryController.deleteLaboratoryADMIN);

//Rutas Privadas -DOCTOR-//
api.post('/saveLaboratoryDoctor', [mdAuth.ensureAuth], laboratoryController.saveLaboratoryADMIN);
api.get('/getLaboratoriesDoctor/:id', [mdAuth.ensureAuth], laboratoryController.getLaboratoriesUSER);
api.get('/getLaboratoryDoctor/:id', [mdAuth.ensureAuth], laboratoryController.getLaboratoryADMIN);
api.put('/updateLaboratoryDoctor/:id', [mdAuth.ensureAuth], laboratoryController.updateLaboratoryADMIN);
api.delete('/deleteLaboratoryDoctor/:id/:idUser', [mdAuth.ensureAuth], laboratoryController.deleteLaboratoryADMIN);

module.exports = api;