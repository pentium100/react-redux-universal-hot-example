'use strict';

/**
 * Entry point for KOAN app. Initiates database connection and starts listening for requests on configured port.
 */

var config = require('./src/config/config'),
    //mongo = require('./src/config/mongo'),
    //mongoSeed = require('./src/config/mongo-seed'),
    koaConfig = require('./src/config/koa'),
    ws = require('./src/config/ws'),

    mssqlSeed = require('./src/config/mssql-seed'),
    co = require('co'),
    koa = require('koa'),
    app = koa();


module.exports = app;

/**
 * Initiates a new KOAN server. Returns a promise.
 * @param overwriteDB Overwrite existing database with the seed data. Useful for testing environment.
 */
app.init = co.wrap(function*(overwriteDB) {
    // initialize mongodb and populate the database with seed data if empty
    //yield mongo.connect();
    //yield mongoSeed(overwriteDB);
    yield mssqlSeed(overwriteDB);

    // koa config
    koaConfig(app);

    // create http and websocket servers and start listening for requests
    app.server = app.listen(config.app.port);
    ws.listen(app.server);
    if (config.app.env !== 'test') {
        console.log('KOAN listening on port ' + config.app.port);
    }
});

// auto init if this app is not being initialized by another module (i.e. using require('./app').init();)
if (!module.parent) {
    app.init().catch(function(err) {
        console.error(err.stack);
        process.exit(1);
    });
}