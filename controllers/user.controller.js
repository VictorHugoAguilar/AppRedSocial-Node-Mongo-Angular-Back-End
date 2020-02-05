'use-strict'
const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt-nodejs');


module.exports = class UserController {

    static home(req, res) {
        res.status(200).send({ msg: 'Accion de home en el servidor de node.js' });
    }

    static prueba(req, res) {
        res.status(200).send({ msg: 'Accion de pruebas en el servidor de node.js' });
    }

    static saveUser(req, res) {

        // Validamos los parametros de entrada
        var params = req.body;
        var user = new UserModel();

        if (params.name && params.surname && params.nick && params.email && params.password) {
            user.name = params.name;
            user.surname = params.surname;
            user.nick = params.nick;
            user.email = params.email;
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
                    bcrypt.hash(user.password, null, null, (err, hash) => {

                        //console.log(hash);

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

}