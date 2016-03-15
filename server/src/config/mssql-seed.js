'use strict';

var mssql = require('./mssql'),
    jwt = require('koa-jwt'),
    config = require('./config'),
    acl = require('./acl');


/**
 * Populates the database with seed data.
 * @param overwrite Overwrite existing database even if it is not empty.
 */
function *seed(overwrite) {
  var count = yield mssql.db.User.count({}, {limit: 1});
  if (overwrite || count === 0) {

    // now populate collections with fresh data
    var user1 = yield mssql.db.User.create(users[0], {});

    acl.addUserRoles(user1.id, ['role_admin']);
  }
}

// declare seed data
var users = [
  {
    //_id: 1,
    email: 'clw@itg.net',
    password: jwt.sign(config.app.pass,config.app.secret),
    name: '陈立伟',
    role: 'role_admin'

  }

];


var now = new Date();
function getTime(h) {
  return new Date(new Date(now).setHours(now.getHours() + h));
}


// export seed data and seed function
seed.users = users;

module.exports = seed;

