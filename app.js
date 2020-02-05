'use strict'
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// cargar rutas
const userRoutes = require('./routes/user.router');

// cargar middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cargar cors

// rutas
app.use('/api', userRoutes);

// exportar
module.exports = app;