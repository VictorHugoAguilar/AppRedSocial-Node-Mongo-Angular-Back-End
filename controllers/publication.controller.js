/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoosePaginate = require('mongoose-paginate');

// Cargamos los controladores
const Publication = require('../models/publication.model');
const Follow = require('../models/follow.model');
const User = require('../models/user.model');

module.exports = class PublicationController {

    /**
     * Método para probar el check del controlador publication
     * @param {*} req 
     * @param {*} res 
     */
    static checkPublication(req, res) {
        return res.status(200)
            .send({
                OK: true,
                message: 'Hola desde la ruta de PublicationController'
            });
    }

    /**
     * Insertamos una nueva publicación
     * @param {*} req -> object publication
     * @param {*} res 
     */
    static savePublication(req, res) {
        var params = req.body;
        var publication = new Publication();

        if (params.text === undefined || !params.text) {
            return res.status(404).send({
                OK: false,
                message: 'Tienes que introducir un mensaje'
            });
        }

        publication.text = params.text;
        publication.file = 'null';
        publication.user = req.user.sub;
        publication.created_at = moment().unix();

        publication.save((err, publicationStored) => {
            if (err) {
                return res.status(500).send({
                    OK: false,
                    message: 'Error al guardar la publicación'
                });
            }
            if (!publicationStored) {
                return res.status(404).send({
                    OK: false,
                    message: 'La publicación no ha podido ser guardada'
                });
            }

            return res.status(200).send({
                OK: true,
                publication: publicationStored
            });
        });
    }


    /**
     * Devuelve todas las publicaciones de los que seguimos
     * @param {*} req 
     * @param {*} res 
     */
    static getPublications(req, res) {
        var page = 1;
        var itemsPerPage = 3;
        if (req.params.page) {
            page = req.params.page;
        }

        Follow.find({ 'user': req.user.sub }).populate('followed')
            .exec()
            .then(follows => {
                var followsClean = [];
                follows.forEach(follow => followsClean.push(follow.followed));

                Publication.find({ user: { "$in": followsClean } })
                    .sort({ 'created_at': -1 })
                    .populate('user')
                    .paginate(page, itemsPerPage, (err, publication, total) => {
                        if (err) {
                            return res.status(500).send({
                                OK: false,
                                message: 'Error del servicio al devolver publicaciones'
                            });
                        }
                        if (!publication) {
                            return res.status(404).send({
                                OK: false,
                                message: 'No hay publicaciones'
                            });
                        }

                        return res.status(200).send({
                            OK: true,
                            page: page,
                            pages: Math.ceil(total / itemsPerPage),
                            itemsPerPage: itemsPerPage,
                            total: total,
                            publication: publication,
                        });
                    });

            })
            .catch(err => {
                return res.status(500).send({
                    OK: false,
                    message: 'Error al devolver el seguimiento'
                });
            });
    }

    /**
     * Obtenemos una publicacion 
     * @param {*} req -> params Id obligatorio
     * @param {*} res 
     */
    static getPublication(req, res) {
        var publicationId = req.params.id;

        if (publicationId === undefined || !publicationId) {
            return res.status(404)
                .send({
                    OK: false,
                    message: 'No se ha introducido un id de publicación'
                });
        }

        Publication.findById(publicationId)
            .exec()
            .then(publication => {
                if (!publication) {
                    return res.status(404).send({
                        OK: false,
                        message: 'No existe la publicacion'
                    });
                }
                return res.status(200).send({
                    OK: true,
                    publication: publication,
                });
            })
            .catch(error => {
                return res.status(500).send({
                    OK: false,
                    message: 'Error del servicio al devolver publicaciones'
                });
            });
    }

    /**
     * Eliminar una publicacion
     * @param {*} req 
     * @param {*} res 
     */
    static deletePublication(req, res) {
        var publicationId = req.params.id;

        if (publicationId === undefined || !publicationId) {
            return res.status(404)
                .send({
                    OK: false,
                    message: 'No se ha introducido un id de publicación'
                });
        }

        Publication.find({ 'user': req.user.sub, '_id': publicationId }).remove((err) => {
            if (err) {
                return res.status(500).send({
                    OK: false,
                    message: 'Error al borrar una publicaciones'
                });
            }
            /* if (!publicationRemoved) {
                return res.status(404).send({
                    OK: false,
                    message: 'No se ha borrado la publicacion'
                });
            }*/
            return res.status(200).send({
                OK: true,
                publicationId: publicationId,
                message: 'Publicación eliminada'
            });
        });
    }

    static uploadImage(req, res) {
        var publicationId = req.params.id;

        if (req.files) {
            var filePath = req.files.image.path;
            console.log(filePath)
            var fileSplit = filePath.split('\/');
            var fileName = fileSplit[2];
            var fileExt = fileName.split('\.')[1];

            if (fileExt === 'png' || fileExt === 'gif' || fileExt === 'jpg' || fileExt === 'jpeg') {

                Publication.findOne({ 'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {
                    console.log(publication)
                    if (publication || publication !== null) {
                        Publication.findByIdAndUpdate(publicationId, { file: fileName }, { new: true, safe: true }, (err, publicationUpdated) => {
                            if (err) {
                                return res.status(500).send({ OK: false, message: 'Error en la petición' });
                            }
                            if (!publicationUpdated) {
                                return res.status(404).send({ OK: false, message: 'No se ha podido actualizar la publicación' });
                            }
                            return res.status(200).send({ OK: true, publication: publicationUpdated });
                        });
                    } else {
                        console.log('eliminamos y pa casa');
                        return removeFileOfUploads(res, filePath, 'No tienes permiso para actualizar esta publicación');
                    }
                });
            } else {
                return removeFileOfUploads(res, filePath, 'Extension no válida');
            }
        } else {
            return res.status(200).send({ OK: false, message: 'No se ha podido subir la imagen' });
        }
    }

    /**
     * Método para devover una imagen
     * @param {*} req 
     * @param {*} res 
     */
    static getImageFile(req, res) {
        var fileImage = req.params.fileImage;
        var pathFile = './uploads/publications/' + fileImage;

        fs.exists(pathFile, (exists) => {
            if (exists) {
                res.sendFile(path.resolve(pathFile));
            } else {
                res.status(200).send({ OK: false, message: 'No existe la imagen' });
            }
        });
    }
};


/**
 * Eliminar los ficheros y devolver un aviso
 * @param {*} res 
 * @param {*} filePath 
 * @param {*} message 
 */
function removeFileOfUploads(res, filePath, message) {
    fs.unlink(filePath, (err) => {
        return res.status(200).send({
            OK: false,
            message
        });
    });
}