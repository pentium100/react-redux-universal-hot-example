'use strict';


module.exports = {

    whereBuilder: function(search){

        var where = {};

        Object.keys(search).forEach(function(element, index){
            
            if(typeof(search[element]) === 'string'){

                where[element] = {$like: '%'+search[element]+'%'};
            }
            if(search[element] instanceof Date){

                if(index.substr(-4)==='From'){
                    where[element].$gte=search[element];
                }else
                if(index.substr(-2)==='To'){
                    where[element].$lte = search[element];
                }else{

                    where[element].$eq = search[element];
                }
            }

        });
        return where;
    }

};