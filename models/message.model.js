/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = Schema({

    emmiter: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created_At: {
        type: String,
        trim: true
    },
    text: {
        type: String,
        trim: false
    },
    view: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Message', MessageSchema);