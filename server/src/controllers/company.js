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
    app.use(route.post('/api/company', createCompany));
    app.use(route.get('/api/company', listCompany));
    app.use(route.get('/api/company/:id', getCompany));
    app.use(route.put('/api/company/:id', updateCompany));
    app.use(route.delete('/api/company/:id', deleteCompany));

};


function* deleteCompany(id){

  var company = yield db.Company.findById(id);
  console.log(company);
  company.destroy();

  this.status = 200;
  this.body = {
      id: company.id
  };

}


function* createCompany(){

  var company = this.request.body;

  console.log(company.name);
  var result = yield db.Company.create(company);

  this.status = 201;
  this.body = {
      id: result.id
  };

}


function* updateCompany(id){


  var company = yield db.Company.findById(id);
  yield company.update(this.request.body);

  this.status = 201;
  this.body = {
      id: company.id
  };

}



function* getCompany(id){

  var company = yield db.Company.findById(id);

  this.body = company;



}

function* listCompany(){
  var size = this.request.query.per_page;
  var page = this.request.query.page;
  var skip = size * (page - 1);


  var result = yield db.Company.findAndCountAll({
      limit: size,
      offset: skip,
      order: [
          ['id', 'ASC']
      ]
  });

  this.set(paginationUtil.generateLinkHeader('api/company', page, size, result.count));



  this.body = result.rows;



}
