'use strict'

const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testAppointment', appointmentController.appointmentTest);


//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveAppointment', [mdAuth.ensureAuth, mdAuth.isAdmin], appointmentController.saveAppointmentADMIN);
api.get('/getAppointments', [mdAuth.ensureAuth, mdAuth.isAdmin], appointmentController.getAppointmentsADMIN);
api.get('/getAppointment/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], appointmentController.getAppointmentADMIN);
api.put('/updateAppointment/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], appointmentController.updateAppointmentADMIN);
api.delete('/deleteAppointment/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], appointmentController.deleteAppointmentADMIN);


module.exports = api;