'use strict';

var express = require('express');

var verifier = require('./lib/verifier');


/**
 * @typedef {Object} RouterConfig
 * @property {string} [description]             A description for this endpoint
 * @property {parseCb} [error]                  An error handler that overrides the default behavior for all params on this endpoint
 * @property {parseCb} [validate]               A validator the overrides the default behavior for all params on this endpoint
 * @property {parseCb} [success]                A success handler that overrides the default behavior for all params on this endpoint
 * @property {Object.<string, ParamDef|String>} params A map with param definitions for each passed in parameter
 */

/**
 * @typedef {Object} ParamDef
 * @property {string} type
 * @property {*} [default]
 * @property {boolean} [required=false]
 * @property {string} [description]
 * @property {number} [min]             min characters for string, min value for number, ignored for boolean
 * @property {number} [max]             max characters for string, min value for number, ignored for boolean
 * @property {parseCb} [error]          An error handler that overrides the default behavior for this parameter
 * @property {parseCb} [validate]       A validator the overrides the default behavior for this parameter
 * @property {parseCb} [success]        A success handler that overrides the default behavior for this parameter
 */

/**
 * All supported methods by the express router that need to be proxied.
 * @type {string[]} The method names
 */
var methods = [
    'get', 'post', 'put', 'head', 'delete', 'options', 'trace', 'copy', 'lock', 'mkcol', 'move', 'purge',
    'propfind', 'proppatch', 'unlock', 'report', 'mkactivity', 'checkout', 'merge', 'm-search', 'notify',
    'subscribe', 'unsubscribe', 'patch', 'search', 'connect'
];

/**
 * The router function that create a new router and proxies all requests so that verification can be done for each path.
 * @param {RouterConfig} [configuration]    An options object that will be passed on to the express router and this router for config
 * @param {Object} [router]                 An optional router instance that can be used instead of using the default express one
 * @returns {*} The middleware function that can be used by app.use()
 */
function Router(configuration = {}, router = express.Router(configuration)) {
    var context = { endpoints: {}, router };
    for (let method of methods) {
        let original = router[method];
        router[method] = (...args) => verifier.configure.call(context, original, method, ...args)
    }
    return router;
}

module.exports = Router;
