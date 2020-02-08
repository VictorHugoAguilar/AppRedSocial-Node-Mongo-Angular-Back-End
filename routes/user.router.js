'use strict'
const express = require('express');
const UserController = require('../controllers/user.controller');

// Middleware
const mda = require('../middlewares/authenticated.middleware');
const multipart = require('connect-multiparty');
const mdUpload = multipart({ uploadDir: './uploads/users' });

const api = express.Router();


// CONTROLADORES DE USUARIOS
api.get('/home', UserController.home);
// pasamos con el middleware
api.get('/prueba', mda.authentification, UserController.prueba);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', mda.authentification, UserController.getUser);
api.get('/users/:page?', mda.authentification, UserController.getUsers);
api.put('/update/:id', mda.authentification, UserController.updateUser);
api.post('/uploadImage/:id', [mda.authentification, mdUpload], UserController.uploadImage);
api.get('/getImage/:fileImage', mda.authentification, UserController.getImageFile);
api.get('/counter/:id?', mda.authentification, UserController.getCounters);


module.exports = api;