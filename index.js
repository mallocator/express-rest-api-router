'use strict';

var express = require('express');

var verifier = require('./lib/verifier');


/**
 * @typedef {Object} RouterConfig
 * @property {parseCb} [error]                  An error handler that overrides the default behavior for all params on this endpoint
 * @property {parseCb} [validate]               A validator the overrides the default behavior for all params on this endpoint
 * @property {parseCb} [success]                A success handler that overrides the default behavior for all params on this endpoint
 * @property {string} [mapEndpoint='/']         The default endpoint with which the api map can be retrieved
 * @property {string[]} [paramOrder]            The order in which parameters are parsed from the client object for all endpoints
 *                                              The default order is 'body', 'query', 'params', 'cookie' which map to express properties
 * @property {boolean} [caseSensitive=false]    Express router option to handle paths respecting case
 * @property {boolean} [mergeParams=false]      Express router option to preserve req.params from parent router
 * @property {boolean} [strict=false]           Express router option to not ignore trailing slashes on endpoints
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
 * @typedef {Object} Context
 * @property {function} router                              The original express router
 * @property {RouterConfig} globalConfiguration             The router global configuration
 * @property {Object.<string, EndpointConfig>} endpoints    A map of endpoints to store configurations in
 */

/**
 * @typedef {Object} EndpointConfig
 * @property {string} [description]             A description for this endpoint
 * @property {parseCb} [error]                  A global error handler that overrides the default behavior
 * @property {parseCb} [validate]               A global validator the overrides the default behavior
 * @property {parseCb} [success]                A global success handler that overrides the default behavior
 * @property {string[]} [paramOrder]            The order in which parameters are parsed from the client object for this endpoint
 *                                              The default order is 'body', 'query', 'params', 'cookies' which map to express properties
 * @property {Object.<string, ParamDef|String>} params A map with param definitions for each passed in parameter
 */

/**
 * @typedef {Object} ParseResult
 * @property {boolean} error    True if this callback is the result of a processing error
 */

/**
 * @callback parseCb
 * @param {ParseResult} error   An error callback that has information such as endpoints or missing parameters
 * @oaran {ClientRequest} req   The http request object
 * @param {ServerResponse} res  The http response object
 * @param {function} next       The chaining function that allows other handlers to be executed after this one
 */

/**
 * @typedef {Object} MissingInfo
 * @property {string} type  The parameter type such as boolean, number or string
 * @property {string} error A short description of the error that occurred
 * @property {number} [min] If the parameter is out of range, information about the range settings
 * @property {number} [max] If the parameter is out of range, information about the range settings
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
    configuration.paramOrder = configuration.paramOrder || ['body', 'query', 'params', 'cookies'];
    var context = { endpoints: {}, router, globalConfiguration: configuration };
    for (let method of methods) {
        let original = router[method];
        router[method] = (...args) => verifier.configure.call(context, original, method, ...args)
    }
    return router;
}

module.exports = Router;
