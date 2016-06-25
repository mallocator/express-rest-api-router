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

    describe('#parseParam()', () => {
        it('should parse all simple types', () => {
            expect(verifier.parseParam('string')).to.deep.equal(mkParam('string'));
            expect(verifier.parseParam('number')).to.deep.equal(mkParam('number'));
            expect(verifier.parseParam('float')).to.deep.equal(mkParam('number'));
            expect(verifier.parseParam('double')).to.deep.equal(mkParam('number'));
            expect(verifier.parseParam('integer')).to.deep.equal(mkParam('number'));
            expect(verifier.parseParam('short')).to.deep.equal(mkParam('number'));
            expect(verifier.parseParam('bool')).to.deep.equal(mkParam('bool'));
            expect(verifier.parseParam('boolean')).to.deep.equal(mkParam('bool'));
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
});