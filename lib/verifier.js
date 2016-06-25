'use strict';


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
    if (configuration.params) {
        for (let param in configuration.params) {
            configuration.params[param] = exports.parseParam(configuration.params[param]);
        }
    }
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

/**
 * Converts a string parameter into a parameter definition.
 * @param {string|ParamDef} str
 * @returns {ParamDef}
 */
exports.parseParam = function(str) {
    if (typeof str == 'string') {
        var match = str.match(/(\w+)(\(([^)]*)\))?/);
        var type = match[1];
        var required = !match[2];
        var def = match[3];
        switch (type) {
            case 'string':
                def && def.length || (def = undefined);
                break;
            case 'bool':
            case 'boolean':
                switch (def) {
                    case 1:
                    case 'TRUE':
                    case 'true':
                    case 'T':
                    case 't':
                    case 'yes':
                    case 'y':
                        def = true;
                        break;
                    case 0:
                    case 'FALSE':
                    case 'false':
                    case 'F':
                    case 'f':
                    case 'no':
                    case 'n':
                        def = false;
                        break;
                    default:
                        def = undefined;
                }
                type = 'bool';
                break;
            case 'number':
            case 'float':
            case 'double':
                def = parseFloat(def);
                isNaN(def) && (def = undefined);
                type = 'number';
                break;
            case 'integer':
            case 'short':
                def = parseInt(def);
                isNaN(def) && (def = undefined);
                type = 'number';
                break;
            default:
                throw new Error('Invalid type defined for parameter: ' + type);
        }
        return {
            type,
            default: def,
            required
        }
    }
    if (typeof str == 'object') {
        switch(str.required) {
            case 0:
            case 'FALSE':
            case 'false':
            case 'F':
            case 'f':
            case 'no':
            case 'n':
            case false:
                str.required = false;
                break;
            default:
                str.required = !str.default;
        }
        str.default = str.default || undefined;
        return str;
    }
    throw new Error('Given parameter is incompatible');
};