## Synopsis

Library to enable oneliners where a oneliner is a succession of asynchronous calls

## Code Example

Consider that I want to list my buildings with detail please

    curl 'http://localhost/v1/endpoints'
    {
        links:{
            me: '/v1/me'
        }
    }
    curl 'http://localhost/v1/me'
    {
        links:{
            zoneApps: '/v1/me/zoneApps'
        }
    }
    curl 'http://localhost/v1/me/zoneApps'
    {
        items:[
            {
                id:1,
                type:'house',
                links:{
                    details:'/v1/houses/1'
                }
            },
            {
                id:1,
                type:'building',
                links:{
                    details:/v1/buildings/1'
                }
            }
        ]
    }
    curl 'http://localhost/v1/houses/1'
    {
        id:'housedetail'
    }

This library enables the oneliner

    As([{links:{endpoints:'/v1/endpoints'}}]).endpoints().me().zoneApps().filter(x=>x.type=='building').details().then(housedetails=>{
        //[{id:'housedetail'}]
    })


## Motivation

I just want a oneliner. Aim is not to be an api discovery (with or without consistency check) but a simple shorthander.

## Installation

In package.json

npm install apishort

## API Reference

### Usage ###
Just require the module...

    var As = require('apishort')

Build As with the first collection (which serves as root). The first collection must implements ```{links:{somekey:'someurl'}}```

    As(fistCollection).somekey()//

The pagination is not (yet) supported.
You can inject the query parameters in your function calls

    As(fistCollection).somekey({offset:3, limit:9000})

Then and Catch the exception as usual
    
    As(x).then(arr=>...).catch(e=>...)

### Configuration ###

You may use your own Promise library

    var As = requrie('apishort');
    As.Promise = require('bluebird')

## Tests

Run make at the racine

## Contributors

One commit, (at least) one test

## License

WTF
