'use strict';

/**
 * Users controller for user profile relation operations.
 */

var route = require('koa-route'),
    mssql = require('../config/mssql'),
    db = mssql.db,
    jwt = require('koa-jwt'),
    config = require('../config/config');

// register koa routes
exports.init = function (app) {
    app.use(route.post('/api/articleinfo', createArticleInfo));
    app.use(route.get('/api/articleinfo', listArticleInfo));
    app.use(route.get('/api/articleinfo/:id', getArticleInfo));
    app.use(route.put('/api/articleinfo/:id', updateArticleInfo));
    app.use(route.delete('/api/articleinfo/:id', deleteArticleInfo));

};


function* deleteArticleInfo(id) {

    var articleInfo = yield db.ArticleInfo.findById(id);

    articleInfo.destroy();

    this.status = 200;
    this.body = {
        id: articleInfo.id
    };

}


function* createArticleInfo() {

    var articleInfo = this.request.body;

    var article = yield db.Article.findOne({where:{name:articleInfo.article.name}});

    if(article==null){

        throw new Error(`找不到品种${articleInfo.article.name}，请检查。`);
    }

    var result = yield db.ArticleInfo.create(articleInfo);
    yield result.setArticle(article);


    this.status = 201;
    this.body = {
        id: result.id
    };

}



function* updateArticleInfo(id) {


    var articleInfo = yield db.ArticleInfo.findById(id);

    var data = this.request.body;
    var article = yield db.Article.findOne({where:{name:data.article.name}});

    if(article==null){

        throw new Error(`找不到品种${data.article.name}，请检查。`);
    }


    yield articleInfo.update(data);
    yield articleInfo.setArticle(article);

    this.status = 201;
    this.body = {
        id: articleInfo.id
    };

}


function* getArticleInfo(id) {

    var articleInfo = yield db.ArticleInfo.findById(id, {


    });

    this.body = articleInfo;


}

function* listArticleInfo() {
    var size = parseInt(this.request.query.per_page);
    var page = parseInt(this.request.query.page);
    var skip = size * (page - 1);


    var result = yield db.ArticleInfo.findAndCountAll({
        limit: size,
        offset: skip,
        include:[{model:db.Article, as:'article'}],
        order: [
            [mssql.Sequelize.literal('Article.name'), 'ASC'],
            ['dateFrom', 'ASC']
        ]

    });




    this.body = {
        data: result.rows,
        size: size,
        page: page,
        ttlRecords: result.count
    };


}
