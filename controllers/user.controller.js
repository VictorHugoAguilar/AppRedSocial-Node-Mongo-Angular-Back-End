'use-strict'
// Cargamos los modelos
const UserModel = require('../models/user.model');
const FollowModel = require('../models/follow.model');
const PublicationModel = require('../models/publication.model');

// Cargamos los modulos
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt.service');
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');


module.exports = class UserController {

    static home(req, res) {
        res.status(200).send({ msg: 'Accion de home en el servidor de node.js' });
    }

    static prueba(req, res) {
        res.status(200).send({ msg: 'Accion de pruebas en el servidor de node.js' });
    }

    /**
     * Método para guardar un usuario
     * @param {*} req 
     * @param {*} res 
     */
    static saveUser(req, res) {

        // Validamos los parametros de entrada
        var params = req.body;
        var user = new UserModel();

        if (params.name && params.surname && params.nick && params.email && params.password) {
            user.name = params.name.trim();
            user.surname = params.surname.toLowerCase().trim();
            user.nick = params.nick.trim();
            user.email = params.email.toLowerCase().trim();
            user.role = 'ROLE_USER';
            user.image = null;

            // comprobamos que el usuario no existe ya en la bd
            UserModel.find({
                $or: [
                    { email: user.email.toLowerCase() },
                    { nick: user.nick.toLowerCase() }
                ]
            }).exec((err, users) => {
                if (err) {
                    return res.status(500).send({
                        ok: false,
                        message: 'Error al guardar en base de datos'
                    });
                }
                if (users && users.length >= 1) {
                    return res.status(200).send({
                        ok: false,
                        message: 'Usuario ya existe en la bd'
                    });
                } else {
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;
                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(500).send({
                                    ok: false,
                                    message: 'Error al guardar en base de datos'
                                });
                            }

                            if (userStored) {
                                return res.status(200).send({ user: userStored });
                            } else {
                                return res.status(404).send({
                                    ok: false,
                                    message: 'Usuario no registrado'
                                });
                            }
                        });
                    });
                }
            });
        } else {
            return res.status(404).send({
                ok: false,
                message: 'Envia todos los campos necesarios',
                user: {
                    name: 'nombre',
                    surname: 'apellido',
                    email: 'email',
                    nick: 'nick',
                    password: 'password'
                }
            });
        }



    }

    /**
     * Método para logearse en la app
     * @param {*} req 
     * @param {*} res 
     */
    static loginUser(req, res) {
        var params = req.body;
        var email = params.email.toLowerCase().trim();
        var password = params.password.trim();

        UserModel.findOne({ email: email }, (err, user) => {
            //console.log(user);
            if (err) {
                return res.status(500).send({
                    OK: false,
                    message: 'Error en la petición'
                });
            }

            if (user) {
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        if (params.token) {
                            // devolver el token
                            let token = jwt.createToken(user);
                            // generear el token
                            return res.status(200).send({ token });
                        } else {
                            // devolver datos de usuario pero no el password
                            user.password = undefined;
                            return res.status(200).send({
                                OK: true,
                                user
                            });
                        }
                    } else {
                        return res.status(404).send({
                            OK: false,
                            message: 'Usuario no identificado'
                        });
                    }
                });
            } else {
                return res.status(404).send({
                    OK: false,
                    message: 'Usuario no identificado, o no esta registrado'
                });
            }
        });
    }

    /**
     * Obtener un usuario
     * @param {*} req -> Id del usuario
     * @param {*} res 
     */
    static getUser(req, res) {
        const idUser = req.params.id;
        UserModel.findById(idUser, (err, user) => {
            if (err) {
                return res.status(500).send({
                    OK: false,
                    message: 'Error en la petición'
                });
            }

            if (!user) {
                return res.status(404).send({
                    OK: false,
                    message: 'Usuario no identificado, o no esta registrado'
                });
            }

            // async function followThisUser 
            followThisUser(req.user.sub, idUser)
                .then(value => {
                    user.password = undefined;
                    return res.status(200)
                        .send({
                            OK: true,
                            user: user,
                            following: value.following,
                            followed: value.followed
                        });
                })
                .catch(err => {
                    return res.status(500).send({
                        OK: false,
                        message: 'Error al comprobar el seguimiento',
                        error: err
                    });
                });
        });
    }

    /**
     * Obtener todos los usuarios paginados
     * @param {*} req 
     * @param {*} res 
     */
    static getUsers(req, res) {
        // comprobamos el usuario logeado
        const identityUserId = req.user.sub;

        var page = 1;
        var itemsPerPage = 5;

        if (req.params.page) {
            page = req.params.page;
        }

        UserModel.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
            if (err) {
                return res.status(500).send({
                    OK: false,
                    message: 'Error en la petición'
                });
            }
            if (!users) {
                return res.status(404).send({
                    OK: false,
                    message: 'No hay usuarios disponibles'
                });
            }

            followUserId(identityUserId).then(value => {

                return res.status(200).send({
                    OK: true,
                    users: users,
                    usersFollowing: value.following,
                    usersFollowMe: value.followed,
                    total: total,
                    pages: Math.ceil(total / itemsPerPage)
                });
            });


        });
    }

    /**
     * Método para actualizar los usuarios
     * @param {*} req -> Pasamos el id del user
     * @param {*} res 
     */
    static updateUser(req, res) {
        var userId = req.params.id;
        var update = req.body;
        // Quitamos la propiedad password del user
        delete update.password;

        if (userId != req.user.sub) {
            return res.status(500).send({
                OK: false,
                message: 'No tienes permiso para actualizar datos del usuario'
            });
        }

        UserModel.findByIdAndUpdate(userId, update, { new: true, safe: true }, (err, userUpdate) => {
            if (err) {
                return res.status(500).send({
                    OK: false,
                    message: 'Error en la petición'
                });
            }
            if (!userUpdate) {
                return res.status(404).send({
                    OK: false,
                    message: 'No se ha podido actualizar el usuario'
                });
            }
            return res.status(200).send({
                OK: true,
                userUpdate
            });
        });
    }

    /**
     * Método para subir imagenes
     * @param {*} req -> Id, de users
     * @param {*} res 
     */
    static uploadImage(req, res) {
        var userId = req.params.id;
        var update = req.body;
        // Quitamos la propiedad password del user
        delete update.password;

        if (req.files) {
            var filePath = req.files.image.path;
            var fileSplit = filePath.split('\/');
            var fileName = fileSplit[2];
            var extFile = fileName.split('\.')[1];

            if (userId != req.user.sub) {
                // Eliminamos el fichero
                return removeFileOfUploads(res, filePath, 'No tienes permiso para actualizar datos del usuario');
            }

            if (extFile === 'png' || extFile === 'gif' || extFile === 'jpeg' || extFile === 'jpg') {
                // Actualizamos el documento de usuario logueado
                UserModel.findByIdAndUpdate(userId, { image: fileName }, { new: true, safe: true }, (err, userUpdate) => {
                    if (err) {
                        return res.status(500).send({
                            OK: false,
                            message: 'Error en la petición'
                        });
                    }
                    if (!userUpdate) {
                        return res.status(404).send({
                            OK: false,
                            message: 'No se ha podido actualizar el usuario'
                        });
                    }
                    return res.status(200).send({
                        OK: true,
                        userUpdate
                    });
                });
            } else {
                // Eliminamos el fichero
                return removeFileOfUploads(res, filePath, 'Extension no válida');
            }
        } else {
            return res.status(200).send({
                OK: false,
                message: 'No se han subido archivos'
            });
        }
    }

    /**
     * Método para devover una imagen
     * @param {*} req 
     * @param {*} res 
     */
    static getImageFile(req, res) {
        var fileImage = req.params.fileImage;
        var pathFile = './uploads/users/' + fileImage;

        fs.exists(pathFile, (exists) => {
            if (exists) {
                res.sendFile(path.resolve(pathFile));
            } else {
                res.status(200).send({ OK: false, message: 'No existe la imagen' });
            }
        });
    }

    static getCounters(req, res) {
        var userId = req.params.id ? req.params.id : req.user.sub;

        getCountFollow(userId).then(value => {
            return res.status(200).send(value);
        });
    }


}

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

/**
 * Funcion asincrona para obtener follows, y followed
 * @param {*} identityUserId 
 * @param {*} userId 
 */
async function followThisUser(identityUserId, userId) {
    var following = await FollowModel
        .findOne({ 'user': identityUserId, 'followed': userId })
        .exec()
        .then(following => following)
        .catch(err => handleError(err));

    var followed = await FollowModel.findOne({ 'user': userId, 'followed': identityUserId })
        .exec()
        .then(followed => followed)
        .catch(err => handleError(err));

    return {
        following: following,
        followed: followed
    };
}


/**
 * Obtenemos un contador de following y followed
 * @param {*} userId 
 */
async function getCountFollow(userId) {

    var following = await FollowModel.count({ 'user': userId })
        .exec()
        .then(count => count)
        .catch(err => handleError(err));

    var followed = await FollowModel.count({ 'followed': userId })
        .exec()
        .then(count => count)
        .catch(err => handleError(err));

    var publication = await PublicationModel.count({ 'user': userId })
        .exec()
        .then(count => count)
        .catch(err => handleError(err));

    return {
        following: following,
        followed: followed,
        publications: publication
    }
}



/**
 * Obtener un array limpio de follows
 * @param {*} userId 
 */
async function followUserId(userId) {
    var following = await FollowModel.find({ 'user': userId })
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


    var followed = await FollowModel.find({ 'followed': userId })
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