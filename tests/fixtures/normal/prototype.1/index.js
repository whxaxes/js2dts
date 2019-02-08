
/**
 * Router Class
 * @param {Object} opt option
 * @param {String} opt.path path
 */
function Router(opt) {
  this.opt = opt;
  this.params = {};
}

Router.prototype = new (require('events').EventEmitter)()

const rp = Router.prototype;

rp.get = function(url) {
  return url;
}

/**
 * @param {String} url url
 */
Router.prototype.post = function(url) {
  return url;
}

const rpp = rp;

rpp.head = function(url) {
  return url;
}

// static method
Router.url = url => {
  return url;
}

module.exports = new Router();
