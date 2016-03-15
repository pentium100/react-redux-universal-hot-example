/*jslint node: true */
'use strict';

/**
 * Users controller for user profile relation operations.
 */

var route = require('koa-route'),
    mssql = require('../config/mssql');


// register koa routes
exports.init = function(app) {
//app.use(route.post('/api/pos', createPOS));
app.use(route.get('/api/pos', listPOSes));
//app.use(route.get('/api/pos/:id', getPOS));
};




function* listPOSes() {

    var size = this.request.query.per_page;
    var page = this.request.query.page;
    var skip = size * (page - 1);


    var search = JSON.parse(this.request.query.search);

    var where = sequelizeUtil.whereBuilder(search);

    var result = yield mssql.db.POS.findAndCountAll({
        limit: size,
        offset: skip,
        where: where,
        order: [
            ['id', 'DESC']
        ]
    });



    this.set(paginationUtil.generateLinkHeader('api/pos', page, size, result.count));

    this.body = {
        rows: result.rows
    };

}