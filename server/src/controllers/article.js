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
    app.use(route.post('/api/article', createArticle));
    app.use(route.get('/api/article', listArticle));
    app.use(route.get('/api/article/name/:name', getArticleByName));
    app.use(route.get('/api/article/:id', getArticle));
    app.use(route.put('/api/article/:id', updateArticle));
    app.use(route.delete('/api/article/:id', deleteArticle));

};

function* getArticleByName(name) {
    var article = yield db.Article.findOne({
        where: {
            name: {
                $eq: name
            }
        }

    });
    this.body = article;
    if (article==null){
        this.body ={};
    }

    this.status = 200;



}


function* deleteArticle(id) {

    var article = yield db.Article.findById(id);
    console.log(article);
    article.destroy();

    this.status = 200;
    this.body = {
        id: article.id
    };

}


function* createArticle() {

    var article = this.request.body;

    console.log(article.name);
    var result = yield db.Article.create(article);

    this.status = 201;
    this.body = {
        id: result.id
    };

}


function* updateArticle(id) {


    var article = yield db.Article.findById(id);
    yield article.update(this.request.body);

    this.status = 201;
    this.body = {
        id: article.id
    };

}



function* getArticle(id) {

    var article = yield db.Article.findById(id);

    this.body = article;



}

function* listArticle() {
    var size = this.request.query.per_page;
    var page = this.request.query.page;
    var skip = size * (page - 1);


    var result = yield db.Article.findAndCountAll({
        limit: size,
        offset: skip,
        order: [
            ['id', 'ASC']
        ]
    });

    //this.set(paginationUtil.generateLinkHeader('api/article', page, size, result.count));


    this.body = {
        data: result.rows,
        size: size,
        page: page,
        ttlRecords: result.count
    };
    //this.body = result.rows;



}
