/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const express = require('express');

// Cargamos los controladores
const PublicationController = require('../controllers/publication.controller');

// Middleware
const mda = require('../middlewares/authenticated.middleware');
const multipart = require('connect-multiparty');
const mdUploadPub = multipart({ uploadDir: './uploads/publications' });


const api = express.Router();

// Rutas de publicaciones
api.get('/checkPublication', mda.authentification, PublicationController.checkPublication);
api.post('/publication', mda.authentification, PublicationController.savePublication);
api.get('/publications/:page?', mda.authentification, PublicationController.getPublications);
api.get('/publicationsUser/:UserId/:page?', mda.authentification, PublicationController.getPublicationsUser);
api.get('/publication/:id', mda.authentification, PublicationController.getPublication);
api.delete('/publication/:id', mda.authentification, PublicationController.deletePublication);
api.post('/uploadImagePub/:id', [mda.authentification, mdUploadPub], PublicationController.uploadImage);
api.get('/getImagePub/:fileImage', PublicationController.getImageFile);

module.exports = api;