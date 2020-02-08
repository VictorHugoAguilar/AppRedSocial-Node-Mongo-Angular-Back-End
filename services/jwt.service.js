/*jslint node: true */
'use strict';

/*jshint esversion: 6 */

// Cargamos los modulos
const jwt = require('jwt-simple');
const moment = require('moment');

const secret = 'clave_secreta';

module.exports = class TokenService {

    static createToken(user) {
        var payload = {
            sub: user._id,
            name: user.name,
            surname: user.surname,
            nick: user.nick,
            email: user.email,
            role: user.role,
            image: user.image,
            iat: moment().unix(),
            exp: moment().add(30, 'days').unix()
        };

        return jwt.encode(payload, secret);
    }

}