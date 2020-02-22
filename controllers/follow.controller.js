/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const path = require('path');
const fs = require('fs');

// Cargamos los modelos
const User = require('../models/user.model');
const Follow = require('../models/follow.model');
const FollowModel = require('../models/follow.model');

module.exports = class FollowController {
    /**
     * Método de prueba de conexión al controlador
     * @param {*} req 
     * @param {*} res 
     */
    static checkFollow(req, res) {
        return res.status(200)
            .send({
                OK: true,
                message: 'Probando la ruta del controlador FollowController'
            });
    }

    static saveFollow(req, res) {
        var params = req.body;
        var follow = new Follow();

        follow.user = req.user.sub;
        follow.followed = params.followed;

        follow.save((err, followStored) => {
            if (err) {
                return res.status(500)
                    .send({
                        OK: false,
                        message: 'Error al guardar el seguimiento'
                    });
            }
            if (!followStored) {
                return res.status(404)
                    .send({
                        OK: false,
                        message: 'No se pudo registrar el seguimiento'
                    });
            }
            return res.status(200)
                .send({
                    OK: true,
                    followStored: followStored
                });
        });
    }

    static deleteFollow(req, res) {
        var userId = req.user.sub;
        var followId = req.params.id;

        Follow.find({
            'user': userId,
            'followed': followId
        }).deleteOne(err => {
            if (err) {
                return res.status(500)
                    .send({
                        OK: false,
                        message: 'Error al eliminar el seguimiento'
                    });

            }
            return res.status(200)
                .send({
                    OK: true,
                    message: 'Se ha dejado de seguir'
                });
        });
    }


    /**
     * Obtener los usaurios que seguimos
     * @param {*} req 
     * @param {*} res 
     */
    static getFollowingUser(req, res) {

        var userId = req.params.id && req.params.page ? req.params.id : req.user.sub;
        var page = req.params.page ? req.params.page : req.params.id;
        var itemPerPage = 3;

        Follow.find({ user: userId })
            .populate({ path: 'followed' })
            .paginate(page, itemPerPage, (err, follows, total) => {
                if (err) {
                    return res.status(500)
                        .send({
                            OK: false,
                            message: 'Error en el servidor'
                        });
                }
                if (!follows) {
                    return res.status(200)
                        .send({
                            OK: false,
                            message: 'No esta siguiendo a ningun usuario'
                        });
                }

                // console.log(follows)
                followUserId(req.user.sub).then(value => {
                    return res.status(200).send({
                        OK: true,
                        total: total,
                        pages: Math.ceil(total / itemPerPage),
                        follows: follows,
                        usersFollowing: value.following,
                        usersFollowMe: value.followed,
                    });
                }).catch(
                    error => {
                        console.error(error);
                    }
                );
            });
    }

    /**
     * Obtener los usaurios que seguimos
     * @param {*} req 
     * @param {*} res 
     */
    static getFollowingUserBk(req, res) {

        var userId = req.params.id && req.params.page ? req.params.id : req.user.sub;
        var page = req.params.page ? req.params.page : req.params.id;
        var itemPerPage = 3;

        Follow.find({ user: userId })
            .populate({ path: 'followed' })
            .paginate(page, itemPerPage, (err, follows, total) => {
                if (err) {
                    return res.status(500)
                        .send({
                            OK: false,
                            message: 'Error en el servidor'
                        });
                }
                if (!follows) {
                    return res.status(200)
                        .send({
                            OK: false,
                            message: 'No esta siguiendo a ningun usuario'
                        });
                }

                followUserId(req.user.sub).then(value => {
                    return res.status(200).send({
                        OK: true,
                        total: total,
                        pages: Math.ceil(total / itemPerPage),
                        follows: follows,
                        usersFollowing: value.following,
                        usersFollowMe: value.followed,

                    });
                }).catch(
                    error => {
                        console.error(error);
                    }
                );
            });
    }


    /**
     * Listado de seguidores
     * @param {*} req 
     * @param {*} res 
     */
    static getFollowedUsers(req, res) {
        var userId = req.params.id && req.params.page ? req.params.id : req.user.sub;
        var page = req.params.page ? req.params.page : req.params.id;
        var itemPerPage = 3;

        Follow.find({ followed: userId })
            .populate('user')
            .paginate(page, itemPerPage, (err, follows, total) => {
                if (err) {
                    return res.status(500)
                        .send({
                            OK: false,
                            message: 'Error en el servidor'
                        });
                }
                if (!follows) {
                    return res.status(200)
                        .send({
                            OK: false,
                            message: 'No te sigue ningún usuario'
                        });
                }
                followUserId(req.user.sub).then(value => {
                    return res.status(200)
                        .send({
                            OK: true,
                            total: total,
                            pages: Math.ceil(total / itemPerPage),
                            follows: follows,
                            usersFollowing: value.following,
                            usersFollowMe: value.followed,
                        });
                });
            });
    }

    /**
     * Devolver usuarios que sigo
     * @param {*} req 
     * @param {*} res 
     */
    static getMyFollows(req, res) {
        var userId = req.user.sub;
        Follow.find({ user: userId })
            .populate('user followed')
            .exec((err, follows) => {
                if (err) {
                    return res.status(500)
                        .send({
                            OK: false,
                            message: 'Error en el servidor'
                        });
                }
                if (!follows) {
                    return res.status(200)
                        .send({
                            OK: false,
                            message: 'No siguies a ningún usuario'
                        });
                }
                return res.status(200).send({
                    OK: true,
                    follows: follows
                });
            });
    }

    /**
     * Devolver listado de usuarios
     * @param {*} req 
     * @param {*} res 
     */
    static getFollowBacks(req, res) {
        var userId = req.user.sub;
        var find = Follow.find({ user: userId });
        if (req.params.followed) {
            find = Follow.find({ followed: userId });
        }
        find.populate('user followed')
            .exec((err, follows) => {
                if (err) {
                    return res.status(500)
                        .send({
                            OK: false,
                            message: 'Error en el servidor'
                        });
                }
                if (!follows) {
                    return res.status(200)
                        .send({
                            OK: false,
                            message: 'No siguies a ningún usuario'
                        });
                }
                return res.status(200).send({
                    OK: true,
                    follows: follows
                });
            });
    }

};


/**
 * Obtener un array limpio de follows
 * @param {*} userId 
 */
async function followUserId(userId) {
    var following = await Follow.find({ 'user': userId })
        .select({ '_id': 0, '__v': 0, 'user': 0 })
        .exec()
        .then(follows => {
            var followsClean = [];
            follows.forEach(follow => {
                followsClean.push(follow.followed);
            });
            return followsClean;
        })
        .catch(err => handleError(err));


    var followed = await Follow.find({ 'followed': userId })
        .select({ '_id': 0, '__v': 0, 'followed': 0 })
        .exec()
        .then(follows => {
            var followsClean = [];
            follows.forEach(follow => {
                followsClean.push(follow.user);
            });
            return followsClean;
        })
        .catch(err => handleError(err));

    return {
        following: following,
        followed: followed
    };
}