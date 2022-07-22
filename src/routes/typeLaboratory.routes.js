'use strict'

const express = require('express');
const typeLaboratoryController = require('../controllers/typeLaboratory.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testTypeLaboratory',typeLaboratoryController.testTypeLaboratory);

//Rutas Privadas//
api.post('/saveTypeLaboratory', [mdAuth.ensureAuth, mdAuth.isAdmin], typeLaboratoryController.saveTypeLaboratory);
api.get('/getTypesLaboratory', [mdAuth.ensureAuth, mdAuth.isAdmin], typeLaboratoryController.getTypesLaboratory);
api.delete('/deleteTypeLaboratory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typeLaboratoryController.deleteTypeLaboratory);
api.get('/getTypeLaboratory/:id',  [mdAuth.ensureAuth, mdAuth.isAdmin], typeLaboratoryController.getTypeLaboratory);
api.put('/updateTypeLaboratory/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typeLaboratoryController.updateTypeLaboratory);

module.exports = api;