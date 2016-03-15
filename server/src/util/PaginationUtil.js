'use strict';



var generateLinkHeader = function(baseUrl, page, limit, count) {

    var headers = {};

    headers['X-Total-Count'] = count;
    var link = '';
    var totalPages = Math.ceil(count / limit);
    if (page < totalPages) {
        link = "<" + (baseUrl + "?page=" + (page + 1) + "&per_page=" + limit) + ">; rel=\"next\",";
    }
    if (page > 1) {
        link += "<" + (baseUrl + "?page=" + (page - 1) + "&per_page=" + limit) + ">; rel=\"prev\",";
    }
    link += "<" + (baseUrl + "?page=" + totalPages + "&per_page=" + limit) + ">; rel=\"last\"," +
        "<" + (baseUrl + "?page=" + 1 + "&per_page=" + limit) + ">; rel=\"first\"";

    headers.link = link;
    return headers;

};


module.exports = {

    'generateLinkHeader': generateLinkHeader
};
