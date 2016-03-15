'use strict';

/**
 * Users controller for user profile relation operations.
 */

var route = require('koa-route'),
    mssql = require('../../config/mssql'),
    db = mssql.db,
    co = require('co'),
    acl = require('../../config/acl'),
    jwt = require('koa-jwt'),
    config = require('../../config/config');

var tradeController = require('../trade');
// register koa routes
exports.init = function (app) {
    app.use(route.post('/api/report/openinterest', openInterest));

};

function* openInterest() {



    var where = this.request.body.where || {} ;
    var toDate = new Date(this.request.body.date);

    where = Object.assign(where,
        {
            "open": {
                $eq: 1
            },
            tradeDate:{
                $lte:toDate
            },
            "closeAt": {
                $or: [

                    {$eq: null},
                    {$gt: toDate}
                ]
            }

        }
    );


    var size = parseInt(this.request.body.per_page);
    var page = parseInt(this.request.body.page);
    var sort = this.request.body.sort  || ['id', 'ASC'];


    var detailsWhere = where.details || {};
    delete where.details;
    var headerIds = yield db.TradeDetail.aggregate('TradeHeaderId', 'DISTINCT', {
        plain: false,
        include: [{model: db.TradeHeader, as: 'TradeHeader', where}],
        where: Object.assign(detailsWhere, {open: 1})
    });
    headerIds = headerIds.map(e=>e.DISTINCT);
    where.id = {$in: headerIds};
    var skip = size * (page - 1);

    var count = yield db.TradeHeader.count(
        {
            distinct: true,
            include: [{
                model: db.TradeDetail,
                as: 'details',
                include: [{
                    model: db.Contract,
                    as: 'contract'
                }]
            }, {
                model: db.Strategy,
                as: 'strategy'
            },
            ],
            where
        }
    );
    var result = yield db.TradeHeader.findAll({
        limit: size,
        offset: skip,
        include: [{
            model: db.TradeDetail,
            as: 'details',
            include: [{
                model: db.Contract,
                as: 'contract'
            }],
            attributes:Object.keys(db.TradeDetail.attributes).concat([
                [mssql.Sequelize.literal('' +
                    ' (SELECT SUM(quantity) ' +
                    ' FROM `TradeDetails` ' +
                    ' WHERE `TradeDetails`.`closeToId` = `TradeHeader`.`id` ' +
                    ' and `open` = -1' +
                    ' and `tradeDate` <=\'' +  toDate.toISOString() + '\''+
                    ' and TradeDetails.seque = `details`.`seque`)'),
                    'closed']
            ])
        }, {
            model: db.Strategy,
            as: 'strategy'
        }],
        order: [sort],
        where
    });

    var result2 = [];
    for(let trade of result){
        trade.details = trade.details.sort((d1, d2)=>d1.seque>d2.seque);
        var defferedCharge1 = yield tradeController.calcDefferedCharge({
            tradeDate: toDate,
            detailId: trade.details[0].id,
            quantity: trade.details[0].quantity
        });
        var defferedCharge2 = yield tradeController.calcDefferedCharge({
            tradeDate: toDate,
            detailId: trade.details[1].id,
            quantity: trade.details[1].quantity
        });
        trade.defferedCharge = defferedCharge1 +  defferedCharge2;



        result2.push(trade);
    };
    result = result2;
    var strategyIds = yield db.TradeHeader.aggregate('strategyId', 'DISTINCT', {plain: false, where});
    strategyIds = strategyIds.map(e=>e.DISTINCT);
    var strategys = yield db.Strategy.findAll({where: {id: {$in: strategyIds}}});


    var contractIds = yield db.TradeDetail.aggregate('contractId', 'DISTINCT', {
        plain: false,
        include: [{model: db.TradeHeader, as: 'TradeHeader', where}]
    });
    contractIds = contractIds.map(e=>e.DISTINCT);
    var contracts = yield db.Contract.findAll({where: {id: {$in: contractIds}}});
    var prices = yield getMarketPrice(contracts);
    //console.log(prices);
    var footData = yield db.TradeHeader.findOne({                     //汇总合计平仓盈亏和锁汇盈亏.
        attributes: [
            [mssql.Sequelize.fn('sum', mssql.sequelize.col('closeProfit')), 'closeProfit'],
            [mssql.Sequelize.fn('sum', mssql.sequelize.col('currencyProfit')), 'currencyProfit']
        ],
        where
    });
    var attributes;


    attributes = [
        [mssql.Sequelize.fn('sum', mssql.sequelize.literal('TradeDetail.quantity*TradeDetail.open')), 'quantity'],
        [mssql.Sequelize.fn('sum', mssql.sequelize.literal('TradeDetail.closedQuantity')), 'closedQuantity'],
        'seque'
    ];
    var detailData = yield db.TradeDetail.findAll({             //汇总各腿剩余数量.
        attributes,
        limit: 10,
        raw: true,
        group: ['seque'],
        include: [{model: db.TradeHeader, attributes: [], as: 'TradeHeader', where}],
        where: {}
    });

    var avgDiff = yield db.TradeDetail.findOne({             //汇总各腿剩余数量.
        attributes: [
            [mssql.Sequelize.fn('sum', mssql.sequelize.col('diffQuantity')), 'diffQuantity'],
            [mssql.Sequelize.fn('sum', mssql.sequelize.literal('TradeHeader.priceDiff1*TradeDetail.diffQuantity')), 'priceDiff1'],
            [mssql.Sequelize.fn('sum', mssql.sequelize.literal('TradeHeader.priceDiff2*TradeDetail.diffQuantity')), 'priceDiff2']

        ],
        raw: true,
        group: ['seque'],
        where: {

            seque: 1
        },
        include: [{model: db.TradeHeader, attributes: [], as: 'TradeHeader', where}]
    });
    var totalInfo = {

        closeProfit: 0,
        currencyProfit: 0,
        details: [],
        priceDiff1: 0,
        priceDiff2: 0
    };

    if (count > 0) {

        totalInfo = {

            closeProfit: footData.closeProfit,
            currencyProfit: footData.currencyProfit,
            details: detailData,
            priceDiff1: avgDiff.priceDiff1 / avgDiff.diffQuantity,
            priceDiff2: avgDiff.priceDiff2 / avgDiff.diffQuantity
        }
    }
    this.body = {
        data: result,
        size: size,
        page: page,
        contracts,
        totalInfo,
        strategys,
        ttlRecords: count
    };

}


function* getMarketPrice(contractIds) {

    var  prices = yield db.MarketPrice.findAll({
            where:mssql.Sequelize.where(mssql.Sequelize.literal('contractId+tradeDate'), ' in ', mssql.Sequelize.literal(`(
                        SELECT contractid+MAX(tradeDate) FROM marketprices
                        GROUP BY contractId)`))

        }
    );

    return prices;


}

function* getArticleByName(name) {
    var article = yield db.Article.findOne({
        where: {
            name: {
                $eq: name
            }
        }

    });
    this.body = article;
    if (article == null) {
        this.body = {};
    }

    this.status = 200;


}


function* deleteArticle(id) {

    var article = yield db.Article.findById(id);
    //console.log(article);
    article.destroy();

    this.status = 200;
    this.body = {
        id: article.id
    };

}


function* createArticle() {

    var article = this.request.body;

    //console.log(article.name);
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
