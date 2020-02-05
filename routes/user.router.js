'use strict'
const express = require('express');
const UserController = require('../controllers/user.controller');

const api = express.Router();

api.get('/home', UserController.home);
api.get('/prueba', UserController.prueba);
api.post('/register', UserController.saveUser);


module.exports = api;