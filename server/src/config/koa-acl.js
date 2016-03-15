'use strict';

var util = require('util');
var co = require('co');
var acl = require('./acl');


var ACL = options => {
  if (!options.user) {
    throw new Error('user getter required');
  }

  ACL.options = options;
  ACL.acl = acl.acl;


};

ACL.middleware = (numPathComponents, userId, actions) => {
  return function*(next) {
    var _numPathComponents = !numPathComponents ? this.request.path.split('/').length - 1 : numPathComponents;
    var _userId = userId;
    if (typeof _userId === 'function') {
      _userId = _userId(this);
    }
    if (!_userId) {
      _userId = ACL.options.user(this);
    }
    var _actions = actions;
    if (!_actions) {
      _actions = this.request.method.toLowerCase();
    }
    var ctx = this;




    yield new Promise(function(resolve, reject) {
        var middleware = ACL.acl.middleware.call(ACL.acl, _numPathComponents, _userId, _actions);
        middleware(ctx.request, ctx.response, co.wrap(function*(err) {
          if (err) {
            return reject(err);
          }
          //console.dir(Sequelize.cls.get('transaction'));
          //transaction = Sequelize.cls.get('transaction');
          
          resolve();
        }));
      })
      .catch(function(err) { //co.wrap(function* (err) {

        ctx.throw(err.errorCode, err.msg);
      });
      //.then( //function() {
      //  co.wrap(function*() {
          //console.dir(transaction);
          //Sequelize.cls.bind('koan-itg');

          //var getNamespace = require('continuation-local-storage').getNamespace;
          //var ns =  getNamespace('koan-itg');
          //ns.set('transaction', transaction);
          //console.dir(ns.get('transaction'));
          //console.dir(Sequelize.cls.get('transaction'));
      //    yield next;   
      //  })
        //}
      //);
      yield next;



  };
};

module.exports = ACL;
