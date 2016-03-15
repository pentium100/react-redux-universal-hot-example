'use strict';

/**
 * Users controller for user profile relation operations.
 */

var route = require('koa-route'),
    mssql = require('../config/mssql'),
    db = mssql.db,
    jwt = require('koa-jwt'),
    config = require('../config/config');
var tradeController = require('./trade');

// register koa routes
exports.init = function (app) {
    app.use(route.post('/api/marketprice', createMarketPrice));
    app.use(route.get('/api/marketprice', listMarketPrice));
    app.use(route.get('/api/marketprice/:id', getMarketPrice));
    app.use(route.put('/api/marketprice/:id', updateMarketPrice));
    app.use(route.delete('/api/marketprice/:id', deleteMarketPrice));

};


function* deleteMarketPrice(id) {

    var Marketprice = yield db.MarketPrice.findById(id);
    //console.log(Marketprice);
    Marketprice.destroy();

    this.status = 200;
    this.body = {
        id: Marketprice.id
    };

}


function* createMarketPrice() {

    var marketprice = this.request.body;

    var contract = yield tradeController.extractContract(marketprice.contract.name);


    var result = yield db.MarketPrice.create(marketprice);
    result.setContract(contract);
    yield result.update({'contractName': contract.get('name')});

    this.status = 201;
    this.body = {
        id: result.id
    };

}



function* updateMarketPrice(id) {


    var marketprice = yield db.MarketPrice.findById(id);
    yield marketprice.update(this.request.body);
    var data = this.request.body;

    var contract = yield tradeController.extractContract(data.contract.name);



    yield marketprice.setContract(contract);
    yield marketprice.update({'contractName': contract.get('name')});




    this.status = 201;
    this.body = {
        id: marketprice.id
    };

}


function* getMarketPrice(id) {

    var marketprice = yield db.MarketPrice.findById(id, {

        include: [{model: db.Contract, as: 'contract', include:[{model:db.Article, as:'article'}]}]
    });

    this.body = marketprice;


}

function* listMarketPrice() {
    var size = parseInt(this.request.query.per_page);
    var page = parseInt(this.request.query.page);
    var skip = size * (page - 1);


    var result = yield db.MarketPrice.findAndCountAll({
        limit: size,
        offset: skip,
        order: [
            ['tradeDate', 'ASC'],
            ['contractName', 'ASC']

        ],
        include: [{model: db.Contract, as: 'contract', include:[{model:db.Article, as:'article'}]}]
    });




    this.body = {
        data: result.rows,
        size: size,
        page: page,
        ttlRecords: result.count
    };


}
