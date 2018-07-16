var https = require('https');
var http = require('http');
var querystring = require('querystring');
var exports = module.exports;
const url = require('url');
function ApiClient(){
}

ApiClient.fetch = function(aUrl, query={}, headers={}){
    var queryStringEnabled = true;
    const myUrl = url.parse(aUrl, queryStringEnabled);
    Object.keys(query).forEach(k=>{
        myUrl.query[k] = query[k];
    })
    var prot = aUrl.includes('https')?https:http;
    var qs = '';
    if(Object.keys(myUrl.query).length){
        qs = '?' + querystring.stringify(myUrl.query)
    }
    return new Promise(function(resolve, reject){
        var reqArgs = {
            method:'GET',
            path:myUrl.pathname + qs,
            hostname:myUrl.hostname,
            headers:headers
        }
        if(myUrl.port){
            reqArgs.port = myUrl.port
        }
        var req = prot.request(reqArgs, function(res){
            var s = '';
            res.on('data', function(chunk){
                if(res.statusCode != 200){
                    return reject(chunk.toString());
                }
                s+= chunk;
            });
            res.on('end', function(){
                try{
                    var result =  JSON.parse(s);
                    return resolve(result);
                }catch(e){
                    return reject(e);
                }
            })
        });
        req.on('error', reject);
        req.end();
    })
}

if(!module.parent){
    return ApiClient.fetch('https://synty-api-dev.citylity.com/v1/endpoints').then(x=>{
        console.log('x : ', x)
    })
}

module.exports = ApiClient;