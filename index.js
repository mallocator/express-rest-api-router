'use strict';

var path = require('path');

var express = require('express');

var responder = require('./lib/responder');
var verifier = require('./lib/verifier');


/**
 * @typedef {Object} RouterConfig
 * @property {string} [prefix]                  An optional prefix that will be used when generating the api map
 * @property {parseCb} [error]                  An error handler that overrides the default behavior for all params on this endpoint
 * @property {validateCb} [validate]            A validator the overrides the default behavior for all params on this endpoint
 * @property {parseCb} [success]                A success handler that overrides the default behavior for all params on this endpoint
 * @property {string} [paramMap=arguments]      The name of the request property where parsed parameters can be found for all endpoints
 * @property {string[]} [paramOrder]            The order in which parameters are parsed from the client object for all endpoints
 *                                              The default order is 'body', 'query', 'params', 'cookie' which map to express properties
 * @property {boolean} [caseSensitive=false]    Express router option to handle paths respecting case
 * @property {boolean} [mergeParams=false]      Express router option to preserve req.params from parent router
 * @property {boolean} [strict=false]           Express router option to not ignore trailing slashes on endpoints
 */

/**
 * @typedef {Object} ParamDef
 * @property {string} type              The data type that this parameter is expected to be
 * @property {*} [default]              The default value to set the parameter to if it's not coming in through the request
 * @property {boolean} [required=false] Whether the request should be rejected if this parameter is missing
 * @property {boolean} [array=false]    Whether the incoming parameter is expected to be treated like an array
 * @property {string} [description]     A description of the parameter that will be printed with the endpoints api info
 * @property {number} [min]             min characters for string, min value for number, ignored for boolean
 * @property {number} [max]             max characters for string, min value for number, ignored for boolean
 * @property {validateCb} [validate]    A validator the overrides the default behavior for this parameter
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
 * @property {validateCb} [validate]            A global validator the overrides the default behavior
 * @property {parseCb} [success]                A global success handler that overrides the default behavior
 * @property {string} [paramMap=arguments]      The name of the request property where parsed parameters can be found
 * @property {string[]} [paramOrder]            The order in which parameters are parsed from the client object.
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
 * @param {ClientRequest} req   The http request object
 * @param {ServerResponse} res  The http response object
 * @param {function} next       The chaining function that allows other handlers to be executed after this one
 */

/**
 * @callback validateCb
 * @param {string} value    The value received from the request
 * @param {string} name     The name of the parameter that we're checking
 * @param {ParamDef} config The configuration for this parameter
 * @returns {string}    An error message or any falsy value if the parameter is valid
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
    configuration.prefix = normalizePrefix(configuration.prefix);
    var context = { endpoints: {}, router, globalConfiguration: configuration };
    for (let method of methods) {
        let original = router[method];
        router[method] = (...args) => verifier.configure.call(context, original, method, ...args)
    }
    router.__defineGetter__('endpoints', prefixEndpoints.bind(context));
    router.api = api.bind(context);
    return router;
}

/**
 * Returns either an empty string or a normalized path of the prefix
 * @param {string} prefix
 * @returns {string}
 */
function normalizePrefix(prefix) {
    if (!prefix || typeof prefix !== 'string' || !prefix.trim().length) {
        return '';
    }
    return path.normalize(prefix);
}

/**
 * Getter implementation that will return the currently configured enpoints.
 * @returns {Object.<string, Object.<string, EndpointConfig>>} Api map with endpoint config nested in path and method.
 * @this Context
 */
function prefixEndpoints(prefix = this.globalConfiguration.prefix) {
    var map = {};
    for (let prop in this.endpoints) {
        map[path.join(prefix, prop)] = Object.assign({}, this.endpoints[prop]);
    }
    return map;
}

/**
 * A standard request handler implementation that will respond with the currently configured api for this router. Can be used to make
 * it easier for developers to work with your API.
 * @param {ClientRequest} req   An express client request object
 * @param {ServerResponse} res  An express server response object
 * @this Context
 */
function api(req, res) {
    var url = req.originalUrl;
    var prefix = url.substr(0, url.lastIndexOf(req.route.path));
    prefix = prefix.substr(0, prefix.lastIndexOf(this.globalConfiguration.prefix));
    responder.respond(req, res, prefixEndpoints.call(this, prefix.length ? prefix : this.globalConfiguration.prefix));
}

module.exports = Router;
