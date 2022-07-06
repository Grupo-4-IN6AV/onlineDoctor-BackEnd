'use strict'

const express = require('express');
const userController = require('../controllers/user.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testUser', userController.userTest);
api.post('/register', userController.register);
api.post('/login', userController.login)

//Rutas Privadas//
api.post('/deleteAccount/:id', mdAuth.ensureAuth, userController.deleteAccount);
api.put('/updateAccount/:id', mdAuth.ensureAuth, userController.updateAccount);

module.exports = api;