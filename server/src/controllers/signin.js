'use strict';

/**
 * Password based signin and OAuth signin functions.
 */

var qs = require('querystring'),
    route = require('koa-route'),
    jwt = require('koa-jwt'),
    request = require('co-request'),
    config = require('../config/config'),
    //mongo = require('../config/mongo'),
    mssql = require('../config/mssql');

// register koa routes
exports.init = function(app) {
    app.use(route.post('/signin', signin));
    app.use(route.post('/api/signin', signin));
};

/**
 * Receives the user credentials and returns a JSON Web Token along with user profile info in JSON format.
 */
function* signin() {
    var credentials = this.request.body;
    var user = yield mssql.db.User.findOne(

        {
            where: {
                email: credentials.email,
                isEnabled: true
            },
            raw: true,
            attributes: [
                'email',
                'name',
                'password',
                'id',
                'role'
            ]
        }
    );

    var signedPassword = jwt.sign(credentials.password, config.app.secret);
    if (!user) {
        this.throw(401, 'Incorrect e-mail address.');
    } else if (user.password !== signedPassword) {
        this.throw(401, 'Incorrect password.');
    } else {
        //user.id = user._id;
        //delete user._id;
        delete user.password;
        user.picture = '/api/users/' + user.id + '/picture';
    }
  
    // sign and send the token along with the user info
    var token = jwt.sign(user, config.app.secret, {
        expiresInMinutes: 5 * 24 * 60 /* 90 days */
    });
    this.body = {
        token: token,
        user: user
    };
}

