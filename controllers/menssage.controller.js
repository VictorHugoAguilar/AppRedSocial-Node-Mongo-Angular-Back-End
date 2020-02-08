/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const moment = require('moment');
const mongoosePaginate = require('mongoose-paginate');

// Cargamos los modelos
const User = require('../models/user.model');
const Follow = require('../models/follow.model');
const Message = require('../models/message.model');

module.exports = class MessageController {

    /**
     * Método de prueba de conexión al controlador
     * @param {*} req 
     * @param {*} res 
     */
    static checkMessage(req, res) {
        return res.status(200)
            .send({
                OK: true,
                message: 'Probando desde la ruta del MessageController'
            });
    }

}