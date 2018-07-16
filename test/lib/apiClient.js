var assert = require('assert');
var Mocker = require('nodelibs').Mocker;
var ApiClient = require('../../lib/apiClient');
var http = require('http');
describe('lib/apiClient',function(){
    it('can override query', Mocker.mockIt(function(mokr){
        mokr.mock(http, 'request', function(data, fn){
            assert.equal(data.path, '/param/test?a=2&b=3&c=3')
            fn({
                statusCode:200,
                on:function(k, cbk){
                    if(k=='data'){
                        cbk('{"ok":true}');
                    }
                    if(k=='end'){
                        return cbk();
                    }
                }
            });
            return;
        })
        return ApiClient.fetch('http://localhost/param/test?a=1&b=2&c=3', {a:2,b:3});
    }));

    it('let url untouched if no query', Mocker.mockIt(function(mokr){
        mokr.mock(http, 'request', function(data, fn){
            assert.equal(data.path, '/param/test')
            assert(!data.hasOwnProperty('port'));
            fn({
                statusCode:200,
                on:function(k, cbk){
                    if(k=='data'){
                        cbk('{"ok":true}');
                    }
                    if(k=='end'){
                        return cbk();
                    }
                }
            });
            return;
        })
        return ApiClient.fetch('http://localhost/param/test');
    }));

    it('encodes port if specified', Mocker.mockIt(function(mokr){
        mokr.mock(http, 'request', function(data, fn){
            assert.equal(data.port, 4040);
            fn({
                statusCode:200,
                on:function(k, cbk){
                    if(k=='data'){
                        cbk('{"ok":true}');
                    }
                    if(k=='end'){
                        return cbk();
                    }
                }
            });
            return;
        })
        return ApiClient.fetch('http://127.0.0.1:4040/param/test');
    }));
});
