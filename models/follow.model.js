/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const FollowSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    followed: {
        type: Schema.ObjectId,
        ref: 'User'
    }

});

FollowSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Follow', FollowSchema);