/* global describe, it, beforeEach, afterEach */
'use strict';

var stream = require('stream');

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

    it('should verify all incoming parameters', done => {
        process.env.NODE_ENV = '';

        var router = Router();
        router.get('/test', {
            params: {
                var1: 'number'
            }
        }, (req, res) => res.end('success'));

        var app = express();
        app.use(router);

        request(app).get('/test').expect(422).end(done);
    });

    it('should verify all incoming parameters and complain about missing ones in development mode', done => {
        process.env.NODE_ENV = 'development';

        var router = Router();
        router.get('/test', {
            params: {
                var1: 'number',
                var2: 'number(1)',
                var3: 'string',
                var4: 'string(test)',
                var5: 'boolean',
                var6: 'boolean(true)'
            }
        }, (req, res) => res.end('success'));

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
