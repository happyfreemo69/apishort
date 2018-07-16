var As = require('../../lib/as');
var assert = require('assert');
var Mocker = require('nodelibs').Mocker;
var ApiClient = require('../../lib/apiClient');

describe('lib/as',function(){
    it('instantiate as array', Mocker.mockIt(function(mokr){
        var as = As([]);
    }));
    
    it('does not wrap a wrap', Mocker.mockIt(function(mokr){
        var as = As([]);
        var bs = As(as);
        assert.equal(as, bs)
    }));

    it('fetch endpoints', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', url=>{
            assert.equal(url, 'myurl');
            return Promise.resolve({
                ok:true
            })
        })
        var as = As([{
            links:{
                endpoints:'myurl'
            }
        }]);
        return as.endpoints().then(x=>{
            assert.equal(x.length, 1);
            assert.equal(x[0].ok, true);
        })
    }));

    it('stacks promises', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', url=>{
            if(url.includes('A')){
                return Promise.resolve([
                    {
                        links:{
                            building: 'zoneId=1'
                        }
                    },
                    {
                        links:{
                            building: 'zoneId=2'
                        }
                    }
                ])
            }
            if(url.includes('zoneId')){
                return Promise.resolve([
                    {
                        id:url+'first'
                    },{
                        id:url+'second'
                    }
                ])
            }
        })
        var as = As([{
            links:{
                endpoints:'A'
            }
        }]);
        return as.endpoints().building().then(x=>{
            assert.equal(x.length, 4);
            assert.equal(x[0].id, 'zoneId=1first');
            assert.equal(x[1].id, 'zoneId=1second');
            assert.equal(x[2].id, 'zoneId=2first');;
            assert.equal(x[3].id, 'zoneId=2second');
        })
    }));

    it('handles collection embedded in items', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', url=>{
            if(url.includes('A')){
                return Promise.resolve({
                    items:[
                        {
                            links:{
                                building: 'zoneId=1'
                            }
                        },
                        {
                            links:{
                                building: 'zoneId=2'
                            }
                        }
                    ]
                })
            }
            if(url.includes('zoneId')){
                return Promise.resolve({
                    items:[
                        {
                            id:url+'first'
                        },{
                            id:url+'second'
                        }
                    ]
                })
            }
        })
        var as = As([{
            links:{
                endpoints:'A'
            }
        }]);
        return as.endpoints().building().then(x=>{
            assert.equal(x.length, 4);
            assert.equal(x[0].id, 'zoneId=1first');
            assert.equal(x[1].id, 'zoneId=1second');
            assert.equal(x[2].id, 'zoneId=2first');;
            assert.equal(x[3].id, 'zoneId=2second');
        })
    }));

    it('forwards api fails', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', url=>{
            return Promise.reject('failing')
        })
        var as = As([{
            links:{
                endpoints:'A'
            }
        }]);
        return as.endpoints().catch(e=>{
            assert.equal(e, 'failing')
        })
    }));

    it('can reduce', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', url=>{
            if(url.includes('zones')){
                return Promise.resolve([
                    {
                        id:'A',
                        type:'house',
                        links:{
                            bbqDetail:'bbqA'
                        }
                    },
                    {
                        id:'B',
                        type:'house',
                        links:{
                            bbqDetail:'bbqB'
                        }
                    },
                    {
                        type:'building'
                    },
                    {
                        type:'building'
                    }
                ])
            }
            if(url.includes('bbq')){
                return Promise.resolve([
                    {
                        id:url+'detail'
                    }
                ])
            }
        })
        var as = As([{
            links:{
                zones:'zones'
            }
        }]);
        return as.zones().reduce((acc,x)=>{
            if(x.type=='house'){
                acc.push(x);
            }
            return acc;
        },[]).bbqDetail().then(res=>{
            assert.equal(res.length, 2);
            assert.equal(res[0].id, 'bbqAdetail');
            assert.equal(res[1].id, 'bbqBdetail');
        })
    }));

    it('can filter', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', url=>{
            return Promise.resolve([
                {
                    id:'A',
                    type:'house',
                    links:{
                        bbqDetail:'bbqA'
                    }
                },
                {
                    id:'B',
                    type:'house',
                    links:{
                        bbqDetail:'bbqB'
                    }
                },
                {
                    type:'building'
                },
                {
                    type:'building'
                }
            ])
        })
        var as = As([{
            links:{
                zones:'zones'
            }
        }]);
        return as.zones().filter(x=>x.type=='house').then(res=>{
            assert.equal(res.length, 2);
        })
    }));
    it('can chain even if single element returned', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', url=>{
            if(url.includes('zone')){
                return Promise.resolve({
                    id:'A',
                    links:{
                        detail:'Adetail'
                    }
                })
            }
            if(url.includes('Adetail')){
                return Promise.resolve({
                    id:url+'B'
                })
            }
        })
        var as = As([{
            links:{
                zone:'zone'
            }
        }]);
        return as.zone().detail().then(res=>{
            assert.equal(res.length, 1);
            assert.equal(res[0].id, 'AdetailB');
        })
    }));

    it('indicate failures if link not found', Mocker.mockIt(function(mokr){

        var as = As([{
            links:{
                zone:'zone'
            }
        }]);
        return as.test().catch(e=>{
            assert.equal(e, 'test link not found in {"links":{"zone":"zone"}}');
        })
    }));

    it('forwards headers', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', (url, query, headers)=>{
            assert.equal(headers.a, 'ok')
            return Promise.resolve({})
        })
        var as = As([{
            links:{
                zone:'zone'
            }
        }], {a:'ok'});
        return as.zone();
    }));

    it('forwards query', Mocker.mockIt(function(mokr){

        mokr.mock(ApiClient, 'fetch', (url, query, headers)=>{
            assert.equal(query.a, 2)
            return Promise.resolve({})
        })
        var as = As([{
            links:{
                zone:'zone'
            }
        }]);
        return as.zone({a:2});
    }));
});
