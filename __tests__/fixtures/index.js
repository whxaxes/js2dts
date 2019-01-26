const events = require('events');
const chokidar = require('chokidar');
const EventEmitter = events.EventEmitter;

const a = '12332';
const b = '555';
const c = 123213;

function test(b) {
  return 123123;
}

class MyClub {
  test() {

  }
}

class Aclub extends MyClub {
  constructor(ctx) {
    this.ctx = ctx;
  }

  abc(bbb = new EventEmitter()) {
    console.info('saasd');
    return '123'
  }

  get bbb() {
    return chokidar.watch();
  }

  [Symbol.for('aaa')]() {
    console.info('sss');
  }
}

function myFn(a = '123', bbb = new events.EventEmitter(), ccc = chokidar.watch()) {
  console.info('asdas');
  // return new events.EventEmitter();
  return chokidar;
}

// module.exports = {
//   abc: 123123,

//   ccccc: 222
// };

// module.exports = function abc(ccc = 123123) {
//   return ccc;
// };

const obj = {
  test: 123,
  aaaa: String(123123),

  async getFn() {
    return this;
  }

  async bbb() {
    // return this;
    return async () => {
      return myFn;
    }
  }
}

module.exports = obj;
