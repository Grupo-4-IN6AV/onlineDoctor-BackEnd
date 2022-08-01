'use strict';

const shoppingCartController = require('../controllers/shoppingCart.controller');

//Constante del Servidor de Express
const express = require('express');

//API enrutador de Express
const api = express.Router();

//Variable de Autenticación - MiddleWare
const mdAuth = require('../middlewares/authenticated');



//P Ú B L I C A S//
api.get('/testShoppingCart', shoppingCartController.testShoppingCart);

//P R I V A D A S//
//Usuarios//
api.post('/createShoppingCart', mdAuth.ensureAuth, shoppingCartController.createShoppingCart);
api.get('/getShoppingCart', mdAuth.ensureAuth, shoppingCartController.getShoppingCart);


module.exports = api;