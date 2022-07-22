'use strict'

const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testAppointment', appointmentController.appointmentTest);


//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveAppointment', [mdAuth.ensureAuth, mdAuth.isAdmin], appointmentController.saveAppointmentADMIN);

module.exports = api;