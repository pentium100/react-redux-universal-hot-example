'use strict';

/**
 * Users controller for user profile relation operations.
 */

var route = require('koa-route'),
    mssql = require('../config/mssql'),
    db = mssql.db,
    co = require('co'),
    acl = require('../config/acl'),
    jwt = require('koa-jwt'),
    config = require('../config/config'),
    paginationUtil = require('../util/PaginationUtil');
var tradeController = require('./trade');

// register koa routes
exports.init = function (app) {
    app.use(route.post('/api/strategy', createStrategy));
    app.use(route.get('/api/strategy', listStrategy));
    app.use(route.get('/api/strategy/:id', getStrategy));
    app.use(route.put('/api/strategy/:id', updateStrategy));
    app.use(route.delete('/api/strategy/:id', deleteStrategy));

};


function* deleteStrategy(id) {

    var strategy = yield db.Strategy.findById(id);
    console.log(strategy);
    strategy.destroy();

    this.status = 200;
    this.body = {
        id: strategy.id
    };

}


function* createStrategy() {

    var strategy = this.request.body;

    
    var result = yield db.Strategy.create(strategy);

    this.status = 201;
    this.body = {
        id: result.id
    };

}



function* updateStrategy(id) {


    var strategy = yield db.Strategy.findById(id);
    yield strategy.update(this.request.body);
    var data = this.request.body;

    var contract1 = yield tradeController.extractContract(data.contract1.name);
    var contract2 = yield tradeController.extractContract(data.contract2.name);

    yield strategy.setContract1(contract1);
    yield strategy.setContract2(contract2);


    this.status = 201;
    this.body = {
        id: strategy.id
    };

}


function* getStrategy(id) {

    var strategy = yield db.Strategy.findById(id, {

        include: [{
            model: db.Contract,
            as: 'contract1',
            include:[{model:db.Article, as:'article'}]
        }, {
            model: db.Contract,
            as: 'contract2',
            include:[{model:db.Article, as:'article'}]
        }]
    });

    this.body = strategy;


}

function* listStrategy() {
    var size = parseInt(this.request.query.per_page);
    var page = parseInt(this.request.query.page);
    var skip = size * (page - 1);


    var result = yield db.Strategy.findAndCountAll({
        limit: size,
        offset: skip,
        order: [
            ['id', 'ASC']
        ],
        include: [{model: db.Contract, as: 'contract1'}, {model: db.Contract, as: 'contract2'}]
    });

    //this.set(paginationUtil.generateLinkHeader('api/strategy', page, size, result.count));


    this.body = {
        data: result.rows,
        size: size,
        page: page,
        ttlRecords: result.count
    };


}
