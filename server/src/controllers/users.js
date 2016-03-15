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
    app.use(route.post('/api/users', createUser));
    app.use(route.get('/api/users', listUsers));
    app.use(route.get('/api/users/:id', getUser));
    app.use(route.delete('/api/users/:id', deleteUser));
    app.use(route.put('/api/users/:id', updateUser));
    app.use(route.put('/api/users/:id/changepassword', changePassword));
};


function* deleteUser(id){
    var user = yield db.User.findById(id);

    var oldRoles = yield acl.userRoles(user.id.toString());



    if (oldRoles && oldRoles.length > 0) {
        yield acl.removeUserRoles(user.id.toString(), oldRoles);
    }


    yield user.destroy();

    this.body = {success:true};
    this.status = 200;
    return;



}

function* changePassword(id){

    if(id!=this.state.user.id){

        this.body = {success:false, message:'用户有误!'};
        this.status = 403;
        return;

    }
    //console.dir(this.request.body);
    var model = this.request.body.changeSet;
    var user = yield mssql.db.User.findById(id);
    var signed = jwt.sign(model.oldPassword, config.app.secret);
    if(user.get('password') === signed){
        var newpassword = jwt.sign(model.newPassword1, config.app.secret);
        yield user.update({password: newpassword});
        this.body = {success:true};
        this.status = 200;
        return;
    }else{
        this.body = {success:false, message:'密码错误!'};
        this.status = 403;

    }

}


function* getUser(id) {

    var user = yield db.User.find({
        raw: true,
        where: {
            id: id
        },
        attributes: [
            'id',
            'email',
            'name',
            'role',
            'contractNo',
            'batchNo',
            'companyId',
            'factoryName',
            'isEnabled'

        ],
        //include:[{model: mssql.db.Company, as:'company'}]
    });

    this.body = user;

}



function* updateUser(id) {

    var ctx = this;

    var result = yield db.User.findById(id);
    var user = ctx.request.body;
    delete user.picture;
    if(user.password && user.password.length>0){
      user.password = jwt.sign(user.password, config.app.secret);
    }else{
      delete user.password;
    }


    var oldRoles = yield acl.userRoles(user.id.toString());

    //console.log(oldRoles);

    if (oldRoles && oldRoles.length > 0) {
        yield acl.removeUserRoles(user.id.toString(), oldRoles);
    }
    yield acl.addUserRoles(user.id.toString(), user.role.split(','));
    result = yield result.update(user);
    ctx.status = 201;
    ctx.body = {
        id: result.id
    };



}



/**
 * Creates a new user.
 */
function* createUser() {
    // todo: check user role === 'admin' when role system is ready
    // we need to validate user body with node-validator here not to save junk data in the database..
    var user = this.request.body;

    // get the latest userId+1 as the new user id
    // this is exceptional to user creation as we want user ids to be sequential numbers and not standard mongo guids
    //user._id = yield mongo.getNextSequence('userId');
    //var results = yield mongo.users.insert(user);
    user.password = jwt.sign(user.password, config.app.secret);
    var result = yield db.User.create(user);
    yield acl.addUserRoles(result.id.toString(), user.role.split(','));

    this.status = 201;
    this.body = {
        id: result.id
    };
}


function* listUsers() {

    var size = this.request.query.per_page;
    var page = this.request.query.page;
    var skip = size * (page - 1);
    //.console.dir(mssql.Sequelize.cls.get('transaction'));
    //var isCustomer = yield acl.hasRole(this.state.user.id.toString(), 'role_customer');
    var isCustomer = false;
    var where = {};
    if (isCustomer) {

        where = {

            id: {
                $eq: this.state.user.id
            }
        };


    }


    var users = yield db.User.findAndCountAll({
        limit: size,
        where: where,
        offset: skip,
        attributes: [
            'id',
            'email',
            'name',
            'role',
            'factoryName'

        ],
        order: [
            ['id', 'DESC']
        ]
    });

    this.set(paginationUtil.generateLinkHeader('api/users', page, size, users.count));



    this.body = users.rows;

}
