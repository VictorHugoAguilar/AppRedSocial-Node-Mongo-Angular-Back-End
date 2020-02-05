'use strict'
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
    created_At: {
        type: String,
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }

});

module.exports = mongoose.model('Publication', PublicationSchema);