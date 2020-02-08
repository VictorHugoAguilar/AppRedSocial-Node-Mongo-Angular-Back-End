/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const express = require('express');

// Cargamos los controladores
const MessageController = require('../controllers/menssage.controller');

// Middleware
const mda = require('../middlewares/authenticated.middleware');


const api = express.Router();

api.get('/checkMessage', MessageController.checkMessage);
api.post('/message', mda.authentification, MessageController.saveMessage);
api.get('/messagesMe/:page?', mda.authentification, MessageController.getReceivedMessages);
api.get('/messagesTo/:page?', mda.authentification, MessageController.getEmmitMessages);
api.get('/messageNoView', mda.authentification, MessageController.getUnviewedMessages);
api.put('/messageView', mda.authentification, MessageController.setViewMessage);


module.exports = api;