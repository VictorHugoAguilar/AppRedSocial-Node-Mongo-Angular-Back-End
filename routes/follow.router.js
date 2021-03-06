/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const express = require('express');

// Cargamos los controladores
const UserController = require('../controllers/user.controller');
const FollowController = require('../controllers/follow.controller');

// Middleware
const mda = require('../middlewares/authenticated.middleware');
const multipart = require('connect-multiparty');
const mdUpload = multipart({ uploadDir: './uploads/users' });

const api = express.Router();

// CONTROLADORES DE FOLLOWS
api.get('checkFollow', FollowController.checkFollow);
api.post('/follow', mda.authentification, FollowController.saveFollow);
api.delete('/follow/:id', mda.authentification, FollowController.deleteFollow);
api.get('/following/:id?/:page?', mda.authentification, FollowController.getFollowingUser);
api.get('/followed/:id?/:page?', mda.authentification, FollowController.getFollowedUsers);
api.get('/follows/:followed?', mda.authentification, FollowController.getFollowBacks);




module.exports = api;