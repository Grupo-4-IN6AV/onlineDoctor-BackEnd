'use strict'

const express = require('express');
const typeLaboratoryController = require('../controllers/typeLaboratory.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testTypeLaboratory',typeLaboratoryController.testTypeLaboratory);

//Rutas Privadas//
api.post('/saveTypeLaboratory', typeLaboratoryController.saveTypeLaboratory);
api.get('/getTypesLaboratory', typeLaboratoryController.getTypesLaboratory);
api.delete('/deleteTypeLaboratory/:id', typeLaboratoryController.deleteTypeLaboratory);
api.get('/getTypeLaboratory/:id', typeLaboratoryController.getTypeLaboratory);

module.exports = api;