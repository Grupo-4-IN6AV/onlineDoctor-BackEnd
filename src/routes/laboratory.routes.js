'use strict'

const express = require('express');
const laboratoryController = require('../controllers/laboratory.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testLaboratory', laboratoryController.laboratoryTest);

//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveLaboratory', [mdAuth.ensureAuth, mdAuth.isAdmin], laboratoryController.saveLaboratoryADMIN);


module.exports = api;