'use strict';


var Sequelize = require('sequelize'),
    fs        = require('fs'),
    path      = require('path'),
    config    = require('./config'),
    lodash    = require('lodash');

var cls = require('continuation-local-storage'),
    namespace = cls.createNamespace('koan-itg');

Sequelize.cls = namespace;
//var sequelize = new Sequelize('exportAgent', 'exportagentdbo', '868898Proc', {
  var sequelize = new Sequelize(config.app.db, config.app.dbuser, config.app.dbpassword, {
    host: 'localhost',
    dialect: config.app.dialect,
    timezone: '+08:00',
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    logging: config.app.logging,
    pool: {
        max: 50,
        min: 0,
        idle: 10000
    },

});

//module.exports = sequelize;

var db = {};

var domainFilePath = __dirname+'/../domain';
fs
  .readdirSync(domainFilePath)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && file.match(/\.js$/);
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(domainFilePath, file));
    db[model.name] = model;
  });
  

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});
sequelize.sync();

module.exports = {
  sequelize: sequelize,
  Sequelize: Sequelize,
  db: db
};




//sequelize.posts.sync();
//sequelize.users.sync();
//sequelize.comments.sync();
