const util = require('../../../../dist/util');
const egg = require('egg');

/** @type {String} abc */
exports.abc = '123';
exports.getJSDoc = util.getJSDoc;
exports.util = util;
exports.mod = require('./mod');

exports.egg = egg;
exports.Application = egg.Application;
exports.Agent = egg.Agent;
