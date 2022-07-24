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


module.exports = api;