/* global describe, it, beforeEach, afterEach */
'use strict';

var stream = require('stream');

var expect = require('chai').expect;
var express = require('express');
var request = require('supertest');

var Router = require('..');

describe('Router', () => {
    it('should process normal requests same as the default router', done => {
        var router = new Router();
        router.get('/test', (req, res) => res.end('success'));

        var app = express();
        app.use(router);

        request(app).get('/test').expect(200, 'success').end(done);
    });

    it('should verify all incoming parameters and complain about missing ones', done => {
        var router = new Router();
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

        request(app).get('/test').expect(422).end(done);
    });
});
