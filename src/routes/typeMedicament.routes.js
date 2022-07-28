'use strict'

const express = require('express');
const typeMedicamentController = require('../controllers/typeMedicament.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testTypeMedicament', typeMedicamentController.typeMedicamentTest);


//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveTypeMedicament', [mdAuth.ensureAuth, mdAuth.isAdmin], typeMedicamentController.saveTypeMedicamentADMIN);
api.put('/updateTypeMedicament/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typeMedicamentController.updateTypeMedicamentADMIN);
api.delete('/deleteTypeMedicament/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typeMedicamentController.deleteTypeMedicamentADMIN);
api.get('/getTypeMedicaments', [mdAuth.ensureAuth, mdAuth.isAdmin], typeMedicamentController.getTypeMedicamentsADMIN);
api.get('/getTypeMedicament/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typeMedicamentController.getTypeMedicamentADMIN);


//RUTAS Privadas -PIPES-//
api.post('/getTypeMedicamentByName', [mdAuth.ensureAuth, mdAuth.isAdmin], typeMedicamentController.getTypeMedicamentByName);
api.get('/getTypeMedicamentAtoZ', [mdAuth.ensureAuth, mdAuth.isAdmin], typeMedicamentController.getTypeMedicamentAtoZ);
api.get('/getTypeMedicamentZtoA', [mdAuth.ensureAuth, mdAuth.isAdmin], typeMedicamentController.getTypeMedicamentZtoA);

module.exports = api;