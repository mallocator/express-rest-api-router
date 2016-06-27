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

        });

        it('should return an error for each missing parameters', () => {

        });

        it('should allow a request with all parameters set to pass', () => {

        });

        it('should ignore params that have an empty or non empty default setting', () => {

        });
    });

    describe('#fillParams()', () => {
        it('should fill parameters with the right primitive types', () => {

        });

        it('should keep empty defaults as undefined', () => {

        });

        it('should only fill parameters that haven\'t been set yet', () => {

        });
    });
});
