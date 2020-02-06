'use-strict'
const jwt = require('jwt-simple');
const moment = require('moment');

const secret = 'clave_secreta';

module.exports = class Ensure {

    static authentification(req, res, next) {

        if (!req.headers.authorization) {
            return res.status(403).send({
                OK: false,
                message: 'La peticion no tiene la cabecera no tienen la autentificación'
            });
        }

        var token = req.headers.authorization.replace(/['"]+/g, '');

        try {
            var payload = jwt.decode(token, secret);
            if (payload.exp <= moment().unix()) {
                res.status(401).send({
                    OK: false,
                    message: 'Token ha expirado'
                });
            }
        } catch (e) {
            res.status(404).send({
                OK: false,
                message: 'Token no es válido'
            });
        }

        req.user = payload;

        next();
    }

}