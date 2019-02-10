const MyTest = require('./other');
const glob = require('globby');
const http = require('http');

module.exports = MyTest;
module.exports.MyTest = MyTest;
module.exports.glob = glob;
module.exports.test = require('./test');
module.exports.http = http;
module.exports.Server = http.Server;
module.exports.events = require('events');
