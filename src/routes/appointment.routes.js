'use strict'

const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testAppointment', appointmentController.appointmentTest);


//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveAppointment', mdAuth.ensureAuth, appointmentController.saveAppointmentADMIN);
api.get('/getAppointments', [mdAuth.ensureAuth, mdAuth.isAdmin], appointmentController.getAppointmentsADMIN);
api.get('/getAppointment/:id', mdAuth.ensureAuth, appointmentController.getAppointmentADMIN);
api.put('/updateAppointment/:id', mdAuth.ensureAuth, appointmentController.updateAppointmentADMIN);
api.delete('/deleteAppointment/:id', mdAuth.ensureAuth, appointmentController.deleteAppointmentADMIN);

//Rutas Privadas -ADMINISTRADOR-//
api.get('/getAppointmentsUser', mdAuth.ensureAuth, appointmentController.getAppointmentsUser);
api.get('/getAppointmentsPaciente', mdAuth.ensureAuth, appointmentController.getAppointmentsPaciente);

module.exports = api;