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


// register koa routes
exports.init = function(app) {
    app.use(route.post('/api/contract', createContract));
    app.use(route.get('/api/contract', listContract));
    app.use(route.get('/api/contract/name/:name', getContractByName));
    app.use(route.get('/api/contract/:id', getContract));
    app.use(route.put('/api/contract/:id', updateContract));
    app.use(route.delete('/api/contract/:id', deleteContract));

};

function* getContractByName(name) {
    var contract = yield db.Contract.findOne({
        where: {
            name: {
                $eq: name
            }
        },
        include:[{model: db.Article, as:'article'}]
    });
    this.body = contract;
    if (contract==null){
        this.body ={};
    }

    this.status = 200;



}


function* deleteContract(id) {

    var contract = yield db.Contract.findById(id);
    console.log(contract);
    contract.destroy();

    this.status = 200;
    this.body = {
        id: contract.id
    };

}


function* createContract() {

    var contract = this.request.body;

    console.log(contract.name);
    var result = yield db.Contract.create(contract);

    this.status = 201;
    this.body = {
        id: result.id
    };

}


function* updateContract(id) {


    var contract = yield db.Contract.findById(id);
    yield contract.update(this.request.body);

    this.status = 201;
    this.body = {
        id: contract.id
    };

}



function* getContract(id) {

    var contract = yield db.Contract.findById(id);

    this.body = contract;



}

function* listContract() {
    var size = this.request.query.per_page;
    var page = this.request.query.page;
    var skip = size * (page - 1);


    var result = yield db.Contract.findAndCountAll({
        limit: size,
        offset: skip,
        order: [
            ['id', 'ASC']
        ]
    });

    //this.set(paginationUtil.generateLinkHeader('api/contract', page, size, result.count));


    this.body = {
        data: result.rows,
        size: size,
        page: page,
        ttlRecords: result.count
    };
    //this.body = result.rows;



}
