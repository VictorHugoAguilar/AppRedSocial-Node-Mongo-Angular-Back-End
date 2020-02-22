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

    static saveMessage(req, res) {
        var params = req.body;

        if (!params.text || !params.receiver) {
            return res.status(200)
                .send({
                    OK: false,
                    message: 'Debe introducir un mensaje'
                });
        }

        var message = new Message();
        message.emitter = req.user.sub;
        message.receiver = params.receiver;
        message.text = params.text;
        message.created_at = moment().unix();
        message.viewed = 'false';

        message.save((err, messageStored) => {
            if (err) {
                return res.status(500)
                    .send({
                        OK: false,
                        message: 'Error en la petición'
                    });
            }
            if (!messageStored) {
                return res.status(404)
                    .send({
                        OK: false,
                        message: 'Error al guardar el mensaje'
                    });
            }
            return res.status(200)
                .send({
                    OK: true,
                    messageStored: messageStored
                });
        });
    }

    /**
     * Listar los mensajes recividos
     * @param {*} req 
     * @param {*} res 
     */
    static getReceivedMessages(req, res) {
        var userId = req.user.sub;
        var page = req.params.page ? req.params.page : '1';
        var itemsPerPage = 5;

        Message.find({ 'receiver': userId })
            .sort({ 'created_at': -1 })
            .populate('emitter', 'name surname _id nick image')
            .paginate(page, itemsPerPage, (err, messages, total) => {
                if (err) {
                    return res.status(500)
                        .send({
                            OK: false,
                            message: 'Error en la petición'
                        });
                }
                if (!messages) {
                    return res.status(404)
                        .send({
                            OK: false,
                            message: 'Error no existen mensajes'
                        });
                }
                return res.status(200)
                    .send({
                        OK: true,
                        page: page,
                        pages: Math.ceil(total / itemsPerPage),
                        total: total,
                        messages: messages,
                    });
            });
    }

    /**
     * Listado de mensajes enviados
     * @param {*} req 
     * @param {*} res 
     */
    static getEmmitMessages(req, res) {
        var userId = req.user.sub;
        var page = req.params.page ? req.params.page : '1';
        var itemsPerPage = 5;

        Message.find({ 'emitter': userId })
            .sort({ 'created_at': -1 })
            .populate('emitter receiver', 'name surname _id nick image')
            .paginate(page, itemsPerPage, (err, messages, total) => {
                if (err) {
                    return res.status(500)
                        .send({
                            OK: false,
                            message: 'Error en la petición'
                        });
                }
                if (!messages) {
                    return res.status(404)
                        .send({
                            OK: false,
                            message: 'Error no existen mensajes'
                        });
                }
                return res.status(200)
                    .send({
                        OK: true,
                        page: page,
                        pages: Math.ceil(total / itemsPerPage),
                        total: total,
                        messages: messages,
                    });
            });
    }

    /**
     * Método que obtiene una lista de mensajes no leidos
     * @param {*} req 
     * @param {*} res 
     */
    static getUnviewedMessages(req, res) {
        var userId = req.user.sub;

        Message.countDocuments({ receiver: userId, viewed: 'false' })
            .exec((err, count) => {
                if (err) {
                    return res.status(500)
                        .send({
                            OK: false,
                            message: 'Errror en la petición'
                        });
                }
                return res.status(200)
                    .send({
                        OK: true,
                        unviewed: count
                    });
            });
    }

    /**
     * Método que pone como leido un mensaje
     * @param {*} req 
     * @param {*} res 
     */
    static setViewMessage(req, res) {
        var userId = req.user.sub;

        Message.update({
            receiver: userId,
            viewed: 'false'
        }, {
            viewed: 'true'
        }, {
            'multi': true
        }, (err, messageUdated) => {
            if (err) {
                return res.status(500)
                    .send({
                        OK: false,
                        message: 'Error en la petición'
                    });
            }
            if (!messageUdated) {
                return res.status(200)
                    .send({
                        OK: false,
                        message: 'Error no se ha podido actualizar el mensaje'
                    });
            }
            return res.status(200)
                .send({
                    OK: true,
                    messages: messageUdated,
                });
        });
    }

};