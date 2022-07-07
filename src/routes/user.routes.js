'use strict'

const express = require('express');
const userController = require('../controllers/user.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testUser', userController.userTest);
api.post('/register', userController.register);
api.post('/login', userController.login)

//Rutas Privadas -USUARIO-//
api.post('/deleteAccount/:id', mdAuth.ensureAuth, userController.deleteAccount);
api.put('/updateAccount/:id', mdAuth.ensureAuth, userController.updateAccount);

//Rutas Privadas -ADMINISTRADOR-//
api.post('/saveUser', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.saveUser);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUsers);
api.get('/getUser/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUser);
api.put('/updateUser/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.updateUser);
api.delete('/deleteUser/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.deleteUser);

module.exports = api;