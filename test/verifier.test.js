/* global describe, it, beforeEach, afterEach */
'use strict';

var expect = require('chai').expect;

var verifier = require('../lib/verifier');


describe('verifier', () => {
    /**
     * @returns {ParamDef}
     */
    function mkParam(type, def, required = true, min, max, error, validate, success) {
        var param = {
            type,
            default: def,
            required
        };
        min && (param.min = min);
        max && (param.max = max);
        error && (param.error = error);
        validate && (param.validate = validate);
        success && (param.success = success);
        return param;
    }

    describe('#configure()', () => {
        it('should normalize the configuration parameters', () => {

        });

        it('should apply global configuration options to individual enpoints', () => {

        });
    });

    describe('#parseParam()', () => {
        it('should parse all simple types', () => {
            expect(verifier.parseParam('string')).to.deep.equal(mkParam('string'));
            expect(verifier.parseParam('number')).to.deep.equal(mkParam('number'));
            expect(verifier.parseParam('float')).to.deep.equal(mkParam('float'));
            expect(verifier.parseParam('double')).to.deep.equal(mkParam('double'));
            expect(verifier.parseParam('integer')).to.deep.equal(mkParam('integer'));
            expect(verifier.parseParam('short')).to.deep.equal(mkParam('short'));
            expect(verifier.parseParam('bool')).to.deep.equal(mkParam('bool'));
            expect(verifier.parseParam('boolean')).to.deep.equal(mkParam('boolean'));
            expect(verifier.parseParam.bind(null, 'something')).to.throw(Error);
        });

        it('should allow for optional params', () => {
            expect(verifier.parseParam('string()')).to.deep.equal(mkParam('string', undefined, false));
            expect(verifier.parseParam('number()')).to.deep.equal(mkParam('number', undefined, false));
            expect(verifier.parseParam('bool()')).to.deep.equal(mkParam('bool', undefined, false));
            expect(verifier.parseParam.bind(null, 'something()')).to.throw(Error);
        });

        it('should allow to set default params', () => {
            expect(verifier.parseParam('string(hello)')).to.deep.equal(mkParam('string', 'hello', false));
            expect(verifier.parseParam('number(20)')).to.deep.equal(mkParam('number', 20, false));
            expect(verifier.parseParam('bool(false)')).to.deep.equal(mkParam('bool', false, false));
            expect(verifier.parseParam.bind(null, 'something(someval)')).to.throw(Error);
        });

        it('should check that passed in params have all required fields', () => {
            expect(verifier.parseParam({ type: 'string' })).to.deep.equal(mkParam('string'));
            expect(verifier.parseParam({ type: 'string', required: false })).to.deep.equal(mkParam('string', undefined, false));
            expect(verifier.parseParam({ type: 'string', required: true })).to.deep.equal(mkParam('string', undefined, true));
            expect(verifier.parseParam({ type: 'string', default: 'test'})).to.deep.equal(mkParam('string', 'test', false));
        });
    });

    describe('#getParams()', () => {
        it('should return all parameters parsed in the default order', () => {

        });

        it('should return all parameters parsed with a custom order', () => {

        });
    });

    describe('#checkParams()', () => {
        it('should not reject an empty parameter list', () => {
            var config = {
                params: {
                    age: mkParam('number')
                }
            };
            var errors = verifier.checkParams(config, {});
            expect(errors).to.deep.equal({
                age: {
                    error: "not set",
                    type: "number"
                }
            });
        });

        it('should return an error for each missing parameters', () => {
            var config = {
                params: {
                    age: mkParam('number'),
                    name: mkParam('string')
                }
            };
            var errors = verifier.checkParams(config, {});
            expect(errors).to.deep.equal({
                age: {
                    error: "not set",
                    type: "number"
                },
                name: {
                    error: "not set",
                    type: "string"
                }
            });
        });

        it('should allow a request with all parameters set to pass', () => {
            var config = {
                params: {
                    age: mkParam('number'),
                    name: mkParam('string')
                }
            };
            var params = {
                age: 25,
                name: 'Jauhn Dough'
            };
            var errors = verifier.checkParams(config, params);
            expect(errors).to.deep.equal({});
        });

        it('should ignore params that have an empty or non empty default setting', () => {
            var config = {
                params: {
                    age: mkParam('number', 30, false),
                    name: mkParam('string', 'Jauhn Dough', false)
                }
            };
            var errors = verifier.checkParams(config, {});
            expect(errors).to.deep.equal({});
        });

        it('should check that minimum limits are respected', () => {
            var config = {
                params: {
                    age: mkParam('number', undefined, true, 10),
                    name: mkParam('string', undefined, true, 5)
                }
            };
            var params = {
                age: 9,
                name: '1234'
            };
            var errors = verifier.checkParams(config, params);
            expect(errors).to.deep.equal({
                age: {
                    error: "value below min value",
                    min: 10,
                    type: "number"
                },
                name: {
                    error: "value below min value",
                    min: 5,
                    type: "string"
                }
            });
        });

        it('should check that maximum limits are respected', () => {
            var config = {
                params: {
                    age: mkParam('number', undefined, true, undefined, 10),
                    name: mkParam('string', undefined, true, undefined, 5)
                }
            };
            var params = {
                age: 11,
                name: '123456'
            };
            var errors = verifier.checkParams(config, params);
            expect(errors).to.deep.equal({
                age: {
                    error: "value exceeds max value",
                    max: 10,
                    type: "number"
                },
                name: {
                    error: "value exceeds max value",
                    max: 5,
                    type: "string"
                }
            });
        });
    });

    describe('#fillParams()', () => {
        it('should fill parameters with the right primitive types', () => {
            var config = {
                params: {
                    age: mkParam('number', 25),
                    name: mkParam('string', 'Jauhn Dough')
                }
            };
            var result = verifier.fillParams(config, {});
            expect(result.age).to.equal(25);
            expect(result.age).to.not.equal('25');
            expect(result.name).to.equal('Jauhn Dough');
        });

        it('should keep empty defaults as undefined', () => {
            var config = {
                params: {
                    age: mkParam('number')
                }
            };
            var result = verifier.fillParams(config, {});
            expect(result).to.deep.equal({
                age: undefined
            })
        });

        it('should only fill parameters that haven\'t been set yet', () => {
            var config = {
                params: {
                    age: mkParam('number', 25),
                    name: mkParam('string', 'Jauhn Dough')
                }
            };
            var params = {
                name: 'The Narrator',
                origin: 'unknown'
            };
            var result = verifier.fillParams(config, params);
            expect(result).to.deep.equal({
                name: 'The Narrator',
                age: 25,
                origin: 'unknown'
            })
        });
    });
});
