var Krawler = require('krawler');

var urls = [
    'https://graph.facebook.com/nodejs',
    'https://graph.facebook.com/facebook',
    'https://graph.facebook.com/cocacola',
    'https://graph.facebook.com/google',
    'https://graph.facebook.com/microsoft',
    'https://graph.facebook.com/posttool',
];

var krawler = new Krawler({
    maxConnections: 5,
    parser: 'json',
    forceUTF8: true
});

krawler
    .queue(urls)
    .on('data', function(json, url, response) {
        // do something with json...
    console.log(json)
    })
    .on('error', function(err, url) {
        // there has been an 'error' on 'url'
    })
    .on('end', function() {
        // all URLs has been fetched
    });