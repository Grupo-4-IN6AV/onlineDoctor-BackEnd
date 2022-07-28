'use strict'

const express = require('express');
const userController = require('../controllers/user.controller');
const api = express.Router();
const mdAuth = require('../middlewares/authenticated');

//Rutas Públicas//
api.get('/testUser', userController.userTest);
api.post('/register', userController.register);
api.post('/login', userController.login)

//Rutas Privadas -PACIENTE-//
api.post('/deleteAccount/:id', mdAuth.ensureAuth, userController.deleteAccount);
api.put('/updateAccount/:id', mdAuth.ensureAuth, userController.updateAccount);
api.get('/getUser/:id', mdAuth.ensureAuth, userController.getUser);

//Rutas Privadas -ADMIN-//
api.post('/saveUser', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.saveUser);
api.put('/updateUser/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.updateUser);
api.post('/deleteUser/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.deleteUser);
api.get('/searchUser', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.searchUser);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUsers);


//RUTAS Privadas -PIPES-//
api.get('/getUsersByName', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUsuariosByName);
api.get('/getUsersAtoZ', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUsuariosAtoZ);
api.get('/getUsersZtoA', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getUsuariosZtoA);

module.exports = api;