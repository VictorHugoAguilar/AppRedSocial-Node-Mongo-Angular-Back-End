/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = Schema({

    emitter: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created_at: {
        type: String,
        trim: true
    },
    text: {
        type: String,
        trim: false
    },
    viewed: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Message', MessageSchema);