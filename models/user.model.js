'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
    name: {
        type: String,
        trim: true
    },
    surmane: {
        type: String,
        trim: true
    },
    nick: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    }

});

module.exports = mongoose.model('User', UserSchema);