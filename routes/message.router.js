'use strict'
const express = require('express');

// Cargamos los controladores
const MessageController = require('../controllers/menssage.controller');

// Middleware
const mda = require('../middlewares/authenticated.middleware');


const api = express.Router();

api.get('/checkMessage', MessageController.checkMessage);


module.exports = api;