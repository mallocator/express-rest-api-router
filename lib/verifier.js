'use strict';


/**
 * @typedef {Object} Context
 * @property {function} router                              The original express router
 * @property {Object.<string, EndpointConfig>} endpoints    A map of endpoints to store configurations in
 */

/**
 * @typedef {Object} EndpointConfig
 * @property {parseCb} [error]                  A global error handler that overrides the default behavior
 * @property {parseCb} [validate]               A global validator the overrides the default behavior
 * @property {parseCb} [success]                A global success handler that overrides the default behavior
 * @property {string} [mapEndpoint='/']         The default endpoint with which the api map can be retrieved
 * @property {boolean} [caseSensitive=false]    Express router option to handle paths respecting case
 * @property {boolean} [mergeParams=false]      Express router option to preserve req.params from parent router
 * @property {boolean} [strict=false]           Express router option to not ignore trailing slashes on endpoints
 */

/**
 * @typedef {Object} ParseResult
 * @property {boolean} error    True if this callback is the result of a processing error
 */

/**
 * @callback parseCb
 * @param {ParseResult} error         An error callback that has information such as endpoints or missing parameters
 * @oaran {ClientRequest} req   The http request object
 * @param {ServerResponse} res  The http response object
 * @param {function} next       The chaining function that allows other handlers to be executed after this one
 */

/**
 * A path configuration function that will prepare the verifier with the given configuration and then call the same
 * method on the original router.
 * @param {function} original               The original function (get, post, ...) on the router
 * @param {string} method                   The name of that original function
 * @param {string|RegExp} endpoint          The path definition, same as on the original router
 * @param {EndpointConfig} configuration    The configuration for this endpoint
 * @param {function[]} handlers             Any handlers that should be passed on to the original router
 * @this Context
 * @returns {*}
 */
exports.configure = function(original, method, endpoint, configuration, ...handlers) {
    if (configuration.constructor === Function) {
        return original.call(this.router, endpoint, configuration, ...handlers);
    }
    // TODO parse and normalize config
    this.endpoints[endpoint] = this.endpoints[endpoint] || {};
    this.endpoints[endpoint][method] = configuration;

    return original.call(this.router, endpoint, (...args) => exports.verify.call(this, method, ...args), ...handlers);
};

/**
 * This function is called with every request on this router and verifies incoming parameters and auto populates default
 * values on missing parameters.
 * @param {string} method       The name of that original function
 * @param {ClientRequest} req   The incoming http request
 * @param {ServerResponse} res  The outgoing http response
 * @param {function} next       The chaining function used to call the next handler for this endpoint
 * @this Context
 */
exports.verify = function(method, req, res, next) {
    // TODO verify and auto populate params according to config

    next();
};
