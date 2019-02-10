const events = require('events');

/**
 * my test class
 */
class MyTest extends events.EventEmitter {
  /**
   * test class
   * 
   * @param {Object} options test
   * @param {String} options.name test
   */
  constructor(options) {
    super();
    this.opt = options;
  }

  /**
   * test class
   * 
   * @param {Object} opt test
   * @param {String} opt.name test
   */
  static getInstance(opt) {
    return new MyTest(opt);
  }

  getCount() {
    return this.listenerCount();
  }
}

module.exports = MyTest;
