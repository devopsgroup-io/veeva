/* global it, describe */

'use strict';
var assert = require('assert'),
    exec = require('child_process').exec;


function veeva(task, done) {
    exec('./bin/veeva.js ' + ' ' + task, done);
}

describe('acceptance tests for Veeva Module', function() {


    it('show help passes without error', function(done) {
        veeva('--help', function(error, stdout, stderr) {
            assert.ok(error === null);
            done();
        });
    });

    it('show config passes without error', function(done) {
        veeva('--config', function(error, stdout, stderr) {
            assert.ok(error === null);
            done();
        });
    });

});
