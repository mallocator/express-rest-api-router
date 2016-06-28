/* global describe, it, beforeEach, afterEach */
'use strict';

var stream = require('stream');

var expect = require('chai').expect;
var express = require('express');
var request = require('supertest');

var Router = require('..');


describe('Router', () => {
    it('should process normal requests same as the default router', done => {
        var router = Router();
        router.get('/test', (req, res) => res.end('success'));

        var app = express();
        app.use(router);
        request(app).get('/test').expect(200, 'success').end(done);
    });

    it('should make all incoming and default parameters available on the request handler', done => {
        var router = Router();
        var config = {
            params: {
                var1: 'number',
                var2: 'string(foo)'
            }
        };

        router.get('/test', config, (req, res) => {
            expect(req.args.var1).to.equal(25);
            expect(req.args.var2).to.equal('foo');
            res.end('success');
        });

        var app = express();
        app.use(router);
        request(app).get('/test?var1=25').expect(200).end(done);
    });

    it('should make all be able to use parameters from multiple sources', done => {
        var router = Router();
        var config = {
            params: {
                var1: 'number',
                var2: 'string(foo)',
                var3: 'bool'
            }
        };

        router.get('/test/:var3', config, (req, res) => {
            expect(req.args.var1).to.equal(25);
            expect(req.args.var2).to.equal('foo');
            expect(req.args.var3).to.equal(true);
            res.end('success');
        });

        var app = express();
        app.use(router);
        request(app).get('/test/true?var1=25').expect(200).end(done);
    });

    it('should verify all incoming parameters', done => {
        process.env.NODE_ENV = '';

        var router = Router();
        var config = {
            params: {
                var1: 'number'
            }
        };
        router.get('/test', config, (req, res) => res.end('success'));

        var app = express();
        app.use(router);
        request(app).get('/test').expect(422).end(done);
    });

    it('should verify all incoming parameters and complain about missing ones in development mode', done => {
        process.env.NODE_ENV = 'development';

        var router = Router();
        var config = {
            params: {
                var1: 'number',
                var2: 'number(1)',
                var3: 'string',
                var4: 'string(test)',
                var5: 'boolean',
                var6: 'boolean(true)'
            }
        };
        router.get('/test', config, (req, res) => res.end('success'));

        var app = express();
        app.use(router);
        request(app).get('/test').expect(422, {
            error: 'Required parameters are missing',
            params: {
                var1: { error: 'not set', type: 'number' },
                var3: { error: 'not set', type: 'string' },
                var5: { error: 'not set', type: 'boolean' }
            }
        }).end(done);
    });
});
