'use strict';

/**
 * Environment variables and application configuration.
 */

var path = require('path'),
  _ = require('lodash');

var baseConfig = {
  app: {
    root: path.normalize(__dirname + '/../..'),
    env: process.env.NODE_ENV,
    secret: process.env.SECRET || 'secret key',
    /* used in signing the jwt tokens */
    pass: process.env.PASS || 'pass',
    /* generic password for seed user logins */
  }
};

// environment specific config overrides
var platformConfig = {
  development: {
    app: {
      port: 3003,
      db: 'CreditCard',
      secret: 'itgfzzx8879',
      dbuser: 'root',
      dbpassword: '36987',
      dialect: 'mysql',
      cacheTime: 7 * 24 * 60 * 60 * 1000,
      logging: console.log
    }
  },

  test: {
    app: {
      port: 3001
    }
  },

  production: {
    app: {
      port: 3000,
      cacheTime: 7 * 24 * 60 * 60 * 1000,
      /* default caching time (7 days) for static files, calculated in milliseconds */
      env: 'production',
      secret: 'itgtaoli__??@#$%$$',
      pass: 'pass',
      db: 'tradeBook',
      dbuser: 'root',
      dialect: 'mysql',
      dbpassword: '36987',
      logging: console.log
    }
  }
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, platformConfig[baseConfig.app.env || (baseConfig.app.env = 'development')]);
console.log(module.exports);
