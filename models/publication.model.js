/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublicationSchema = Schema({

    text: {
        type: String,
        trim: true
    },
    file: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Number
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }

});

module.exports = mongoose.model('Publication', PublicationSchema);