'use strict'
const mongoose = require('mongoose');
const colors = require('colors');
const log = console.log;
const app = require('./app');
const PORT = 3800;

mongoose.Promise = global.Promise;

// Conexion database
mongoose.connect('mongodb://localhost:27017/mean_social', { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        log('[mongo] conectado a la bd mongo'.green);

        // crear servidor
        app.listen(PORT, () => {
            log(`[express] servidor corriendo correctament en el puerto ${PORT}`.green);
        });
    })
    .catch(err => {
        log('[nodemon] error en la conexion con la bd'.red, err);
    });