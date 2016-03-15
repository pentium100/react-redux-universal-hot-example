

var route = require('koa-route'),
    mssql = require('../../config/mssql'),
    db = mssql.db,
    co = require('co'),
    acl = require('../../config/acl'),
    jwt = require('koa-jwt'),
    config = require('../../config/config'),

    unitConvert = require('../../util/unitConvert');
var moment = require('moment');


exports.init = function (app) {


};


exports.calcDiff = calcDiff;


function* calcDiff(toDate, trade){


}

function* getNewestMarketPrice(toDate, detail){
    var marketPrice = yield db.MarketPrice.findOne({
        where:{
            contractId:detail.contractId,
            tradeDate:{$lte:toDate}
        },
        order:[['tradeDate', 'desc']]
    });
    return marketPrice;

}