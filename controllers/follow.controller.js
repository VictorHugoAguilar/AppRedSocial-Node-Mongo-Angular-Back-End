'use-strict'
const path = require('path');
const fs = require('fs');

// Cargamos los modelos
const User = require('../models/user.model');
const Follow = require('../models/follow.model');


module.exports = class FollowController {

    static saveFollow(req, res) {
        const params = req.body;
        var follow = new Follow();

        follow.user = req.user.sub;
        follow.followed = params.followed;

        follow.save((err, followStored) => {
            if (err) {
                return res.status(500).send({ OK: false, message: 'Error al guardar el seguimiento' });
            }
            if (!followStored) {
                return res.status(404).send({ OK: false, message: 'No se pudo registrar el seguimiento' });
            }
            return res.status(200).send({
                OK: true,
                followStored
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
                return res.status(500).send({ OK: false, message: 'Error al eliminar el seguimiento' });

            }
            return res.status(200).send({ OK: true, message: 'Se ha dejado de seguir' });
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

        Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemPerPage, (err, follows, total) => {
            if (err) {
                return res.status(500).send({ OK: false, message: 'Error en el servidor' });
            }
            if (!follows) {
                return res.status(200).send({ OK: false, message: 'No esta siguiendo a ningun usuario' });
            }

            return res.status(200).send({
                OK: true,
                total: total,
                pages: Math.ceil(total / itemPerPage),
                follows
            });
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

        Follow.find({ followed: userId }).populate('user').paginate(page, itemPerPage, (err, follows, total) => {
            if (err) {
                return res.status(500).send({ OK: false, message: 'Error en el servidor' });
            }
            if (!follows) {
                return res.status(200).send({ OK: false, message: 'No te sigue ningún usuario' });
            }

            return res.status(200).send({
                OK: true,
                total: total,
                pages: Math.ceil(total / itemPerPage),
                follows
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

        Follow.find({ user: userId }).populate('user followed').exec((err, follows) => {
            if (err) {
                return res.status(500).send({ OK: false, message: 'Error en el servidor' });
            }
            if (!follows) {
                return res.status(200).send({ OK: false, message: 'No siguies a ningún usuario' });
            }
            return res.status(200).send({
                OK: true,
                follows
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

        find.populate('user followed').exec((err, follows) => {
            if (err) {
                return res.status(500).send({ OK: false, message: 'Error en el servidor' });
            }
            if (!follows) {
                return res.status(200).send({ OK: false, message: 'No siguies a ningún usuario' });
            }
            return res.status(200).send({
                OK: true,
                follows
            });
        });

    }

}