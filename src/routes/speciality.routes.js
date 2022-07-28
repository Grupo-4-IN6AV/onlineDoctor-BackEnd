'use strict'

const express = require('express');
const specialityController = require('../controllers/speciality.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testSpeciality',specialityController.testSpeciality);

//Rutas Privadas//
api.post('/saveSpeciality', specialityController.saveSpeciality);
api.get('/getSpecialities', specialityController.getEspecialities);
api.delete('/deleteSpeciality/:id', specialityController.deleteSpeciality);
api.get('/getSpeciality/:id', specialityController.getEspeciality);
api.put('/updateSpeciality/:id', specialityController.updateSpeciality);

//RUTAS Privadas -PIPES-//
api.post('/getSpecialityByName', [mdAuth.ensureAuth, mdAuth.isAdmin], specialityController.getSpecialityByName);
api.get('/getSpecialityAtoZ', [mdAuth.ensureAuth, mdAuth.isAdmin], specialityController.getSpecialityAtoZ);
api.get('/getSpecialityZtoA', [mdAuth.ensureAuth, mdAuth.isAdmin], specialityController.getSpecialityZtoA);

module.exports = api;