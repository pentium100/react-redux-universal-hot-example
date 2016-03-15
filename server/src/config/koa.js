'use strict';

var fs = require('fs'),
  logger = require('koa-logger'),
  send = require('koa-send'),
  jwt = require('koa-jwt'),
  cors = require('koa-cors'),
  koaBody = require('koa-body'),
  //gzip = require('koa-gzip'),
  mssql = require('./mssql'),
  sequelizeTransaction = require('koa-sequelize-transaction'),
  koaAcl = require('./koa-acl'),
  Sequelize = require('sequelize'),
  config = require('./config');

var AclSeq = require('acl-sequelize');
var logger2 = require('tracer').colorConsole();

module.exports = function(app) {
  // middleware configuration

  if (config.app.env !== 'test') {
    app.use(logger());
  }
  if (config.app.env === 'development') {
    app.use(require('koa-livereload')({excludes: ['/modules']}));
  }
  app.use(cors({
    maxAge: config.app.cacheTime / 1000,
    credentials: true,
    methods: 'GET, HEAD, OPTIONS, PUT, POST, DELETE',
    headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  }));
  app.use(koaBody({multipart: true}));

  // app.use(gzip()); register special controllers which should come before any
  // jwt token check and be publicly accessible
  // require('../controllers/public').init(app);
  require('../controllers/signin').init(app);

  // serve the static files in the /client directory, use caching only in
  // production (7 days)
  var sendOpts = config.app.env === 'production'
    ? {
      root: 'dist',
      maxage: config.app.cacheTime
    }
    : {
      root: 'client',
      maxage: config.app.cacheTime
    };
  app.use(function * (next) {
    // do not handle /api paths

    if (this.path.endsWith('.html') || this.path === '/') {

      sendOpts.maxage = 0;
    } else {

      sendOpts.maxage = config.app.cacheTime;
    }
    if (this.path.substr(0, 5).toLowerCase() === '/api/') {
      yield next;
      return;
    } else if (yield send(this, this.path, sendOpts)) {
      // file exists and request successfully served so do nothing
      return;
    } else if (this.path.indexOf('.') !== -1) {
      // file does not exist so do nothing and koa will return 404 by default we treat
      // any path with a dot '.' in it as a request for a file
      return;
    } else {
      // request is for a subdirectory so treat it as an angular route and serve
      // index.html, letting angular handle the routing properly
      yield send(this, '/index.html', sendOpts);
    }
  });

  // middleware below this line is only reached if jwt token is valid
  // app.use(jwt({secret: config.app.secret})); console.dir(!mssql.sequelize );
  // koaAcl({        user: function (ctx) {       return ctx.state.user.id; } });
  // app.use(koaAcl.middleware(2));
  //
  app.use(function * (next) {
    try {
      yield next;
    } catch (err) {
      this.status = err.status || 500;
      this.statusText = err.message;
      this.body = {
        message: err.message
      };
    }
  });

  app.use(sequelizeTransaction({
    // pass an instance of sequelize
    sequelize: mssql.sequelize

  }));

  function initControllers(path, relativePath) {

    fs.readdirSync(path).forEach(function(file) {
      if (fs.statSync(path + '/' + file).isDirectory()) {
        initControllers(path + '/' + file, relativePath + '/' + file);
      } else {
        require(relativePath + '/' + file).init(app);
      }
    });

  }

  initControllers('./src/controllers', '../controllers');

  // mount all the routes defined in the api controllers

};
