'use strict';

var Acl = require('acl');
var mssql = require('./mssql');
var AclSeq = require('acl-sequelize');
var logger = require('tracer').colorConsole();
var Sequelize = require('sequelize');
//var AclKnexBackend = require('acl-knex');
//var knex = require('knex');

//var db = knex({
//    client: 'mysql',
//    debug: true,
//    connection: {
//        host: '127.0.0.1',
//        port: 3306,
//        user: 'root',
//        password: '36987',
//        database: 'koan'
//    }

//});


var sequelize = new Sequelize('koan', 'root', '36987', {
    host: 'localhost',
    dialect: 'mysql',
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});


//var acl = new Acl(new AclKnexBackend(db,'mysql', 'acl_'), logger);
//var acl = new Acl(new AclSeq(sequelize, {prefix: 'acl_'}), logger);
var acl = new Acl(new AclSeq(mssql.sequelize, {prefix: 'acl_'}), logger);


acl.allow([{
    roles: ['role_admin'],
    allows: [{
            resources: ['/api/users', '/api/company', '/api/tradeBook',
                '/api/strategy', '/api/strategy', '/api/article',
                '/api/marketprice', '/api/article', '/api/articleinfo',
                '/api/report'],
            permissions: ['get', 'post', 'put', 'delete']
        }, {
            resources: ['/api/trade'],
            permissions: ['get', 'post', 'put', 'delete']
        }

    ]
}, {
    roles: ['role_user'],
    allows: [{
            resources: '/api/trade',
            permissions: ['get', 'post', 'put','delete']
        }, {
            resources: ['/api/users', '/api/company'],
            permissions: ['get']
        }, 

    ]
}

]);


function removeUserRoles(userId, roles) {


    //return function(callback){

    //    acl.removeUserRoles(userId, roles, callback);

    //};

    //return new Promise(function(resolve, reject) {
    //    acl.removeUserRoles(userId, roles, function(error) {
    //        if (error) {
    //            reject(error);
    //        } else {
    //            resolve(true);
    //        }
    //    });


    //});
    return acl.removeUserRoles(userId, roles);



}

function userRoles(userId) {

    //return function(callback) {
    //    acl.userRoles(userId, callback);
    //};
    //return new Promise(function(resolve, reject) {
    //    acl.userRoles(userId, function(error, roles) {
    //        if (error) {
    //            reject(error);
    //        } else {
    //            resolve(roles);
    //        }
    //    });
    //});

    return acl.userRoles(userId);
}

function addUserRoles(userId, roles) {

    //return function(callback) {
    //    acl.addUserRoles(userId, roles, callback);
    //};
    //return new Promise(function(resolve, reject) {
    //    acl.addUserRoles(userId, roles, function(error) {
    //        if (error) {
    //            reject(error);
    //        } else {
    //            resolve(true);
    //        }
    //    });
    //});
    return acl.addUserRoles(userId, roles);
}

function hasRole(userId, role) {


    //return function(cb){

    //    acl.hasRole(userId, role, cb);
    //};
    //return new Promise(function(resolve, reject) {
    //    acl.hasRole(userId, role, function(error, hasRole) {
    //        if (error) {
    //            reject(error);
    //        } else {
    //           resolve(hasRole);
    //        }
    //    });
    //});
    return acl.hasRole(userId, role);

}

module.exports = {
    acl: acl,
    removeUserRoles: removeUserRoles,
    userRoles: userRoles,
    addUserRoles: addUserRoles,
    hasRole: hasRole

};
