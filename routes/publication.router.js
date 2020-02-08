'use strict'
const express = require('express');
const PublicationController = require('../controllers/publication.controller');

// Middleware
const mda = require('../middlewares/authenticated.middleware');
const multipart = require('connect-multiparty');
const mdUploadPub = multipart({ uploadDir: './uploads/publications' });


const api = express.Router();

// Rutas de publicaciones
api.get('/checkPublication', mda.authentification, PublicationController.checkStatusPage);
api.post('/publication', mda.authentification, PublicationController.savePublication);
api.get('/publications/:page?', mda.authentification, PublicationController.getPublications);
api.get('/publication/:id', mda.authentification, PublicationController.getPublication);
api.delete('/publication/:id', mda.authentification, PublicationController.deletePublication);
api.post('/uploadImagePub/:id', [mda.authentification, mdUploadPub], PublicationController.uploadImage);
api.get('/getImagePub/:fileImage', PublicationController.getImageFile);

module.exports = api;