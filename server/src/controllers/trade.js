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

    unitConvert = require('../util/unitConvert');
var moment = require('moment');

// register koa routes
exports.init = function (app) {
    app.use(route.post('/api/trade/move', createMoveTrade));
    app.use(route.put('/api/trade/move/:id', updateMoveTrade));
    app.use(route.post('/api/trade/defferedcharge', calcDefferedChargeRequest));
    app.use(route.post('/api/trade', createTrade));
    app.use(route.get('/api/trade', listTrade));
    app.use(route.get('/api/trade/:id', getTrade));
    app.use(route.put('/api/trade/:id', updateTrade));
    app.use(route.delete('/api/trade/:id', deleteTrade));
    app.use(route.get('/api/trade', getOnHandTrade));
};
exports.extractContract = extractContract;
exports.calcDefferedCharge = calcDefferedCharge;

function findDefferedCharges(articleInfos, tradeDate) {
    var idx = 0;
    while (idx < articleInfos.length) {

        if (articleInfos[idx].dateFrom <= tradeDate) {
            return articleInfos[idx];
        }
        idx = idx + 1;
    }

    return null;

}

function* calcDefferedCharge(request2) {
    var tradeDetail = yield db.TradeDetail.findById(request2.detailId, {
        include: [
            {model: db.Contract, as: 'contract', include: [{model: db.Article, as: 'article'}]}

        ]

    });

    var defferedCharge = tradeDetail.defferedCharge / tradeDetail.quantity * request2.quantity;


    var contract = yield tradeDetail.getContract();
    var article = yield contract.getArticle();
    if (article.defferedCharge <= 0 || article.defferedCharge == null) {
        return 0;
    }

    var articleInfos = yield db.ArticleInfo.findAll({
        where: {
            articleId: article.id
        },
        order: [['dateFrom', 'desc']]
    });


    var marketPrices = yield db.MarketPrice.findAll({
        where: {
            contractId: tradeDetail.get('contractId'),
            tradeDate: {$between: [tradeDetail.get('tradeDate'), request2.tradeDate]}
        },
        order: [['tradeDate', 'asc']]
    });
    if(marketPrices.length == 0){
        return Math.round(defferedCharge*100)/100;
    }
    var defferedDate = moment(tradeDetail.get('tradeDate'));
    request2.tradeDate = moment(request2.tradeDate);
    var i = 0;
    var lastMarketPrice = marketPrices[0];

    while (defferedDate < request2.tradeDate) {
        let marketPrice = null;
        while (marketPrice == null) {
            if (i >= marketPrices.length) {
                marketPrice = lastMarketPrice;

            }else
            if (defferedDate.isBefore(marketPrices[i].get('tradeDate') ) ) {

                marketPrice = lastMarketPrice;
            }else
            if (defferedDate.isSame(marketPrices[i].get('tradeDate'))) {
                marketPrice = marketPrices[i];
                lastMarketPrice = marketPrice;

            }else
            if (defferedDate.isAfter(marketPrices[i].get('tradeDate'))) {
                lastMarketPrice = marketPrices[i];
            }
            i = i + 1;
        }
        var articleInfo = findDefferedCharges(articleInfos, defferedDate)
        if (marketPrice != null && articleInfo != null) {

            defferedCharge = defferedCharge + unitConvert.convertUnit(request2.quantity, tradeDetail.unit, tradeDetail.priceUnit) * marketPrice.settlePrice * articleInfo.defferedCharge / 10000 * marketPrice.defferedChargeType * tradeDetail.direction;


        }
        defferedDate = defferedDate.add(1,'days');
    }



    return Math.round(defferedCharge*100)/100;

}


function* calcDefferedChargeRequest() {

    var request2 = this.request.body;
    var details = yield db.TradeDetail.findAll({

        where: {
            tradeHeaderId: request2.tradeId
        },
        order: [['seque', 'asc']]
    });

    if (details != null) {

        var defferedCharge1 = yield calcDefferedCharge({
            tradeDate: request2.tradeDate,
            detailId: details[0].id,
            quantity: request2.quantity1
        });
        var defferedCharge2 = yield calcDefferedCharge({
                tradeDate: request2.tradeDate,
                detailId: details[1].id,
                quantity: request2.quantity2
            });

    }

    this.body = {

        defferedCharge1: defferedCharge1,
        defferedCharge2: defferedCharge2
    };
    this.status = 200;
}




function* updateMoveTrade() {

    var moveTrade = this.request.body;
    moveTrade.details = moveTrade.details.sort((a, b)=>a.seque - b.seque);
    var moveTradeInstance = yield db.TradeHeader.findById(moveTrade.id);

    var openTradeInstance = yield db.TradeHeader.findById(moveTrade.parentId, {

        include: [{
            model: db.TradeDetail,
            as: 'details',
            include: [{
                model: db.Contract,
                as: 'contract'
            }]
        }]
    });
    var openTrade = openTradeInstance.toJSON();
    openTrade.details = openTrade.details.sort((a, b)=>a.seque - b.seque);
    var closeTradeInstance = yield db.TradeHeader.findById(moveTradeInstance.get('moveFromId'),
        {
            include: [{
                model: db.TradeDetail,
                as: 'details',
                include: [{
                    model: db.Contract,
                    as: 'contract'
                }]
            }]
        }
    );
    var closeTrade = closeTradeInstance.toJSON();
    closeTrade.details = closeTrade.details.sort((a, b)=>a.seque - b.seque);
    closeTrade.open = "-1";
    closeTrade.parentId = moveTrade.parentId;
    closeTrade.tradeDate = moveTrade.tradeDate;

    closeTrade.docType = moveTrade.docType;

    closeTrade.details[0].tradeDate = closeTrade.tradeDate;
    closeTrade.details[1].tradeDate = closeTrade.tradeDate;
    closeTrade.details[2].tradeDate = closeTrade.tradeDate;

    closeTrade.details[0].closeToId = moveTrade.parentId;
    closeTrade.details[1].closeToId = moveTrade.parentId;
    closeTrade.details[2].closeToId = moveTrade.parentId;

    //closeTrade.details[0].direction = (closeTrade.details[0].direction * -1 ).toString();
    //closeTrade.details[1].direction = (closeTrade.details[1].direction * -1 ).toString();
    //closeTrade.details[2].direction = (closeTrade.details[2].direction * -1 ).toString();

    closeTrade.details[0].open = "-1";
    closeTrade.details[1].open = "-1";
    closeTrade.details[2].open = "-1";

    closeTrade.details[0].quantity = moveTrade.details[0].closeQuantity;
    closeTrade.details[1].quantity = moveTrade.details[1].closeQuantity;
    closeTrade.details[2].quantity = moveTrade.details[2].closeQuantity;


    //平仓交易， 取原始的开仓价为平仓价。
    closeTrade.details[0].price = openTrade.details[0].price;
    closeTrade.details[1].price = openTrade.details[1].price;
    closeTrade.details[2].price = openTrade.details[2].price;

    closeTrade.details[0].price2 = moveTrade.details[0].closePrice;
    closeTrade.details[1].price2 = moveTrade.details[1].closePrice;
    closeTrade.details[2].price2 = moveTrade.details[2].closePrice;

    closeTrade.details[0].contract.name = openTrade.details[0].contract.name;
    closeTrade.details[1].contract.name = openTrade.details[1].contract.name;
    closeTrade.details[2].contract.name = openTrade.details[2].contract.name;


    var value = "";
    value += closeTrade.open == 1 ? "开仓" : "平仓";
    value += closeTrade.details[0].direction == 1 ? "买" : "卖";
    value += closeTrade.details[0].contract.name;
    value += "/";
    value += closeTrade.details[1].direction == 1 ? "买" : "卖";
    value += closeTrade.details[1].contract.name;
    closeTrade.desc = value;


    closeTrade.id = closeTradeInstance.get('id');
    closeTrade.moveToId = moveTrade.id;
    yield closeTradeInstance.update(closeTrade);


    yield createOrUpdateDetails(closeTradeInstance, closeTrade.details);

    moveTrade.moveFromId = closeTradeInstance.get('id');

    moveTrade.details[0].price2 = moveTrade.details[0].openPrice;
    moveTrade.details[1].price2 = moveTrade.details[1].openPrice;
    moveTrade.details[2].price2 = moveTrade.details[2].openPrice;


    moveTradeInstance.update(moveTrade);

    yield createOrUpdateDetails(moveTradeInstance, moveTrade.details);
    //yield closeTradeInstance.setMoveTo(moveTradeInstance);

    this.status = 201;
    this.body = {
        id: moveTradeInstance.get('id')
    };


}


function* createOrUpdateDetails(header, detailRaws) {
    var error = false;
    var details = [];
    for (let detail of detailRaws) {
        var contract = null;
        if (detail.contract.name != "") {
            contract = yield extractContract(detail.contract.name);
            if (contract == null) {
                error = true;
                break;
            }
        }
        detail.tradeDate = header.get('tradeDate');
        detail.open = header.get('open');
        if(detail.quantity==0){
            detail.tradeBookId = null;
        }
        var detailInstance = null;
        if (detail.id > 0) {
            detailInstance = yield db.TradeDetail.findById(detail.id);
            yield detailInstance.update(detail);
        } else {
            detailInstance = yield db.TradeDetail.create(detail);
        }

        detailInstance.setContract(contract);
        details.push(detailInstance);
    }

    if (error) {
        throw new Error('找不到指定的合约!');
    }

    if (header.get('open') == -1) {    //平仓记录， 更新它的开仓记录的已平仓数量。
        var openHeader = yield header.getParent();
        yield updateClosedQuantity(openHeader);
    } else {
        yield updateClosedAt(header);       //开仓记录， 更新自己的最后平仓日期。
        yield updateOpenPrice(header);

    }


    yield header.setDetails(details);

}

function* updateOpenPrice(header){

    var details = yield header.getDetails();

    for(let detail of details){
        var closeDetails = yield db.TradeDetail.findAll({
            where: {
                closeToId: header.id,
                seque: detail.seque
            }

        });
        for(let closeDetail of closeDetails){
            yield closeDetail.update({openPrice: detail.price});
        }

    }
}

function* updateClosedAt(header) {

    var details = yield header.getDetails();

    for (let detail of details) {

        if (detail.quantity > 0) {


            if (detail.quantity > detail.closedQuantity) {
                yield header.update({CloseAt: null});
            } else {
                var closedQuantity = yield db.TradeDetail.findOne({
                    attributes: [
                        [mssql.Sequelize.fn('sum', mssql.sequelize.col('quantity')), 'quantity'],
                        [mssql.Sequelize.fn('max', mssql.sequelize.col('tradeDate')), 'tradeDate']
                    ],
                    where: {
                        closeToId: detail.get('TradeHeaderId'),
                        seque: detail.get('seque')
                    },
                    raw: true
                });
                yield header.update({closeAt: closedQuantity.tradeDate})
            }
        }
    }
}
function* updateClosedQuantity(header){   //修改开仓记录的已平仓数量和最终平仓日期。
    var details = yield header.getDetails();
    for (let detail of details) {
        var openDetail = yield db.TradeDetail.find(
            {
                where: {
                    id: detail.id

                },

                lock: 'UPDATE'
            });

        var closedQuantity = yield db.TradeDetail.findOne({
            attributes: [
                [mssql.Sequelize.fn('sum', mssql.sequelize.col('quantity')), 'quantity'],
                [mssql.Sequelize.fn('max', mssql.sequelize.col('tradeDate')), 'tradeDate']
            ],
            where: {
                closeToId: header.id,
                seque: detail.get('seque')
            },
            raw: true
        });


        if (openDetail.quantity < closedQuantity.quantity) {
            throw new Error('平仓数量不能大于开仓数量！');
        }

        if (openDetail.quantity > 0) {
            if (openDetail.quantity == closedQuantity.quantity) {

                header.update({closeAt: closedQuantity.tradeDate});
            } else {
                header.update({closeAt: null});
            }
        }
        openDetail.update({'closedQuantity': closedQuantity.quantity});

    }


}
function* updateClosedQuantity2(details) {

    for (let detail of details) {
        var openDetail = yield db.TradeDetail.find(
            {
                where: {
                    TradeHeaderId: detail.get('closeToId'),
                    seque: detail.get('seque')
                },

                lock: 'UPDATE'
            });

        var closedQuantity = yield db.TradeDetail.findOne({
            attributes: [
                [mssql.Sequelize.fn('sum', mssql.sequelize.col('quantity')), 'quantity'],
                [mssql.Sequelize.fn('max', mssql.sequelize.col('tradeDate')), 'tradeDate']
            ],
            where: {
                closeToId: detail.get('closeToId'),
                seque: detail.get('seque')
            },
            raw: true
        });


        if (openDetail.quantity < closedQuantity.quantity) {
            throw new Error('平仓数量不能大于开仓数量！');
        }
        var header = yield openDetail.getTradeHeader();
        if (openDetail.quantity > 0) {
            if (openDetail.quantity == closedQuantity.quantity) {

                header.update({closeAt: closedQuantity.tradeDate});
            } else {
                header.update({closeAt: null});
            }
        }
        openDetail.update({'closedQuantity': closedQuantity.quantity});

    }

}
function* createMoveTrade(next) {

    var moveTrade = this.request.body;
    var openTrade = yield db.TradeHeader.findById(moveTrade.parentId, {

        include: [{
            model: db.TradeDetail,
            as: 'details',
            include: [{
                model: db.Contract,
                as: 'contract'
            }]
        }]
    });
    var closeTrade = openTrade.toJSON();
    closeTrade.details = closeTrade.details.sort((a, b)=>a.seque - b.seque);
    closeTrade.open = "-1";
    closeTrade.id = null;
    closeTrade.docType = moveTrade.docType;
    closeTrade.parentId = moveTrade.parentId;
    closeTrade.tradeDate = moveTrade.tradeDate;


    closeTrade.details[0].tradeDate = closeTrade.tradeDate;
    closeTrade.details[1].tradeDate = closeTrade.tradeDate;
    closeTrade.details[2].tradeDate = closeTrade.tradeDate;

    closeTrade.details[0].closeToId = moveTrade.parentId;
    closeTrade.details[1].closeToId = moveTrade.parentId;
    closeTrade.details[2].closeToId = moveTrade.parentId;

    closeTrade.details[0].direction = (closeTrade.details[0].direction * -1 ).toString();
    closeTrade.details[1].direction = (closeTrade.details[1].direction * -1 ).toString();
    closeTrade.details[2].direction = (closeTrade.details[2].direction * -1 ).toString();

    closeTrade.details[0].open = "-1";
    closeTrade.details[1].open = "-1";
    closeTrade.details[2].open = "-1";

    closeTrade.details[0].id = null;
    closeTrade.details[1].id = null;
    closeTrade.details[2].id = null;

    closeTrade.details[0].quantity = moveTrade.details[0].closeQuantity;
    closeTrade.details[1].quantity = moveTrade.details[1].closeQuantity;
    closeTrade.details[2].quantity = moveTrade.details[2].closeQuantity;

    closeTrade.details[0].price2 = moveTrade.details[0].closePrice;
    closeTrade.details[1].price2 = moveTrade.details[1].closePrice;
    closeTrade.details[2].price2 = moveTrade.details[2].closePrice;


    var value = "";
    value += closeTrade.open == 1 ? "开仓" : "平仓";
    value += closeTrade.details[0].direction == 1 ? "买" : "卖";
    value += closeTrade.details[0].contract.name;
    value += "/";
    value += closeTrade.details[1].direction == 1 ? "买" : "卖";
    value += closeTrade.details[1].contract.name;
    closeTrade.desc = value;

    var closeTradeInstance = yield db.TradeHeader.create(closeTrade);

    yield createOrUpdateDetails(closeTradeInstance, closeTrade.details);

    moveTrade.moveFromId = closeTradeInstance.get('id');

    moveTrade.details[0].price2 = moveTrade.details[0].openPrice;
    moveTrade.details[1].price2 = moveTrade.details[1].openPrice;
    moveTrade.details[2].price2 = moveTrade.details[2].openPrice;

    var moveTradeInstance = yield db.TradeHeader.create(moveTrade);

    yield createOrUpdateDetails(moveTradeInstance, moveTrade.details);
    yield closeTradeInstance.setMoveTo(moveTradeInstance);

    this.status = 201;
    this.body = {
        id: moveTradeInstance.get('id')
    };


}

function* getOnHandTrade() {


    var size = parseInt(this.request.query.per_page);
    var page = parseInt(this.request.query.page);
    var skip = size * (page - 1);

    var result = yield db.TradeHeader.findAndCountAll({
        limit: size,
        offset: skip,
        include: [{
            model: db.TradeDetail,
            as: 'details'
        }, {

            model: db.Strategy,
            as: 'strategy'
        }],
        where: {
            "open": {
                $eq: 1
            },

            "closeAt": null


        },

        order: [
            ['id', 'ASC']
        ]
    });


    this.body = {
        data: result.rows,
        size: size,
        page: page,
        ttlRecords: result.count
    };
};


function* deleteTrade(id) {


    var trade = yield db.TradeHeader.findById(id, {
        include: [{
            model: db.TradeDetail,
            as: 'details'
        }]
    });

    //if (trade.get('docType') == 2) {
    var openHeader = null;
    if(trade.open==-1){
       openHeader = yield trade.getParent();
    }
    yield trade.destroy();

    if(openHeader!=null){
        yield updateClosedQuantity(openHeader);
    }
    //} else {

    //    yield trade.destroy();


    //}
    this.status = 200;
    this.body = {
        id: trade.id
    };

};

function* createTrade() {

    var trade = this.request.body;


    var detailsRaw = trade.details;
    delete trade.details;
    var result = yield db.TradeHeader.create(trade);

    yield createOrUpdateDetails(result, detailsRaw);


    if (trade.strategyId == null) {
        var foot1 = yield result.getDetails({where: {seque: 1}});
        var foot2 = yield result.getDetails({where: {seque: 2}});
        var name1 = yield foot1[0].getContract().get('name');
        var name2 = yield foot2[0].getContract().get('name');
        let strategy = {
            direction1: foot1[0].get('direction'),
            direction2: foot2[0].get('direction'),
            desc: (foot1[0].get('direction') == 1 ? '买' : '卖') + name1 + '/' + (foot2[0].get('direction') == 1 ? '买' : '卖') + name2,
            contract1Id: foot1[0].get('contractId'),
            contract2Id: foot2[0].get('contractId'),
            dateFrom: result.get('tradeDate')

        };

        yield result.setStrategy(yield db.Strategy.create(strategy));
    }

    this.status = 201;
    this.body = {
        id: result.id
    };

}

function* extractArticle(contract) {

    var regexs = [/(\w{1,2})\d{4}/, /(XA[U|G])/, /(A[G|U]TD)/, /(LME\w\w)/, /(USD)/];
    

    var article = regexs.reduce((pre, regex)=> {
        if (pre == null) {
            var results = contract.match(regex);
            if (results != undefined) {
                return results[1];
            }
        }
        return pre;
    }, null);

    article = yield db.Article.findOne({where: {name: {$eq: article}}});
    return article;

};

function* extractContract(contract) {

    if (contract != null) {
        contract = contract.toUpperCase();
        var article = yield extractArticle(contract);
        if (article == null) {
            //return null;
            throw new Error(`找不到指定的合约品种,请维护${contract}对应的品种信息.`);
        }
        var result = yield db.Contract.findOrCreate({
            where: {
                name: {
                    $eq: contract
                }
            },
            defaults: {
                name: contract,
                articleId: article.get("id")

            }
        });
        return result[0];
    }
    return null;


}

function* updateTrade(id) {

    var data = this.request.body;
    var trade = yield db.TradeHeader.findById(id);
    yield trade.update(data);
    yield createOrUpdateDetails(trade, data.details);
    this.status = 201;
    this.body = {
        id: trade.id
    };

}


function* getTrade(id) {

    var trade = yield db.TradeHeader.findById(id, {
        include: [{
            model: db.TradeDetail,
            as: 'details',
            order: [['seque', 'ASC']],
            attributes: Object.keys(db.TradeDetail.attributes).concat([
                [mssql.Sequelize.literal('' +
                    ' (SELECT SUM(quantity) ' +
                    ' FROM `TradeDetails` ' +
                    ' WHERE `TradeDetails`.`closeToId` = `TradeHeader`.`id` ' +
                    ' and `open` = -1' +
                    ' and TradeDetails.seque = `details`.`seque`)'),
                    'closed']
            ]),
            include: [{
                model: db.Contract,
                as: 'contract'
            }]
        }, {
            model: db.Strategy,
            as: 'strategy'
        }]
    });

    this.body = trade;


}

function* listTrade(next) {

    var onhand = this.request.query.onhand;
    var where = this.request.query.where != null ? JSON.parse(this.request.query.where) : {};
    if (onhand == 1) {
        where = Object.assign(where,
            {
                "open": {
                    $eq: 1
                },

                "closeAt": null

            }
        );
    }
    ;
    var size = parseInt(this.request.query.per_page);
    var page = parseInt(this.request.query.page);
    var sort = (this.request.query.sort && JSON.parse(this.request.query.sort) ) || [];
    if (sort.length == 0) {
        sort.push(['tradeDate', 'desc']);
        sort.push(['id', 'desc']);
    }
    //sort[0] = mssql.sequelize.col(sort[0]);

    var detailsWhere = where.details || {};
    delete where.details;
    var headerIds = yield db.TradeDetail.aggregate('TradeHeaderId', 'DISTINCT', {
        plain: false,
        include: [{model: db.TradeHeader, as: 'TradeHeader', where}],
        where: Object.assign(detailsWhere, onhand == 1 ? {open: 1} : {})
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
            }],
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
            }]
        }, {
            model: db.Strategy,
            as: 'strategy'
        }],
        order: sort,
        where
    });


    //var strategys = yield db.TradeHeader.findAll({
    //   attributes:[
    //       [mssql.Sequelize.literal('distinct strategyId'),'strategyId']],
    //    include:[{model:db.Strategy, as:'strategy'}]
    //});

    var strategyIds = yield db.TradeHeader.aggregate('strategyId', 'DISTINCT', {plain: false, where});
    strategyIds = strategyIds.map(e=>e.DISTINCT);
    var strategys = yield db.Strategy.findAll({where: {id: {$in: strategyIds}}});


    var contractIds = yield db.TradeDetail.aggregate('contractId', 'DISTINCT', {
        plain: false,
        include: [{model: db.TradeHeader, as: 'TradeHeader', where}]
    });
    contractIds = contractIds.map(e=>e.DISTINCT);
    var contracts = yield db.Contract.findAll({where: {id: {$in: contractIds}}});

    var footData = yield db.TradeHeader.findOne({                     //汇总合计平仓盈亏和锁汇盈亏.
        attributes: [
            [mssql.Sequelize.fn('sum', mssql.sequelize.col('closeProfit')), 'closeProfit'],
            [mssql.Sequelize.fn('sum', mssql.sequelize.col('currencyProfit')), 'currencyProfit'],
        ],
        where
    });
    var attributes;
    if (onhand == 1) {   //计算在手数量时, 取已平仓数量. 如果不是的话, 则计算指定期间的开平仓数量之差.

        attributes = [
            [mssql.Sequelize.fn('sum', mssql.sequelize.literal('TradeDetail.quantity*TradeDetail.open')), 'quantity'],
            [mssql.Sequelize.fn('sum', mssql.sequelize.literal('TradeDetail.closedQuantity')), 'closedQuantity'],
            'seque'
        ];
    } else {

        attributes = [
            [mssql.Sequelize.fn('sum', mssql.sequelize.literal('TradeDetail.quantity*TradeDetail.open')), 'quantity'],

            'seque'
        ];

    }
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

