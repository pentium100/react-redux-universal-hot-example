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
    app.use(route.post('/api/tradeBook', createTradeBook));
    app.use(route.get('/api/tradeBook', listTradeBook));
    app.use(route.get('/api/tradeBook/:id', getTradeBook));
    app.use(route.put('/api/tradeBook/:id', updateTradeBook));

};


function* createTradeBook(){

  var tradeBook = this.request.body;

  console.log(tradeBook.name);
  var result = yield db.TradeBook.create(tradeBook);

  this.status = 201;
  this.body = {
      id: result.id
  };

}


function* updateTradeBook(id){

  var tradeBook = yield db.TradeBook.findById(id);
  yield tradeBook.update(this.request.body);

  this.status = 201;
  this.body = {
      id: tradeBook.id
  };

}



function* getTradeBook(id){

  var tradeBook = yield db.TradeBook.findById(id);

  this.body = tradeBook;



}

function* listTradeBook(){
  var size = this.request.query.per_page;
  var page = this.request.query.page;
  var skip = size * (page - 1);


  var result = yield db.TradeBook.findAndCountAll({
      limit: size,
      offset: skip,
      include: [
          { model: db.Company, as:'company' }
      ],
      order: [
          ['id', 'ASC']
      ]
  });

  this.set(paginationUtil.generateLinkHeader('api/tradebook', page, size, result.count));



  this.body = result.rows;



}
