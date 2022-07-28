'use strict'

const express = require('express');
const doctorController = require('../controllers/doctor.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testDoctor', doctorController.doctorTest);

//Rutas Privadas -DOCTOR-//
api.put('/updateDoctor/:id', mdAuth.ensureAuth, doctorController.updateDoctor);
api.delete('/deleteDoctor/:id', mdAuth.ensureAuth, doctorController.deleteDoctor);
api.get('/getDoctor/:id', mdAuth.ensureAuth, doctorController.getDoctor);

//Rutas Privadas -ADMIN-//
api.post('/saveDoctorAdmin', [mdAuth.ensureAuth, mdAuth.isAdmin], doctorController.saveDoctor);
api.put('/updateDoctorAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], doctorController.updateDoctorByAdmin);
api.post('/deleteDoctorAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], doctorController.deleteDoctorByAdmin);
api.get('/searchDoctor', [mdAuth.ensureAuth, mdAuth.isAdmin], doctorController.searchDoctor);
api.get('/getDoctors', [mdAuth.ensureAuth, mdAuth.isAdmin], doctorController.getDoctors);

//RUTAS Privadas -PIPES-//
api.post('/getDoctorByName', [mdAuth.ensureAuth, mdAuth.isAdmin], doctorController.getDoctorByName);
api.get('/getDoctorAtoZ', [mdAuth.ensureAuth, mdAuth.isAdmin], doctorController.getDoctorAtoZ);
api.get('/getDoctorZtoA', [mdAuth.ensureAuth, mdAuth.isAdmin], doctorController.getDoctorZtoA);

module.exports = api;