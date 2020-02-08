/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// cargar rutas
const userRoutes = require('./routes/user.router');
const followRoutes = require('./routes/follow.router');
const publicationRoutes = require('./routes/publication.router');
const messageRoutes = require('./routes/message.router');

// cargar middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cargar cors

// rutas
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes);
app.use('/api', messageRoutes);

// exportar
module.exports = app;