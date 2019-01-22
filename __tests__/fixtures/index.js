const events = require('events');
const chokidar = require('chokidar');

const a = '12332';
const b = '555';
const c = 123213;

function test(b) {
  return 123123;
}

class Aclub {
  constructor(ctx) {
    this.ctx = ctx;
  }

  abc(bbb = new events.EventEmitter()) {
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


module.exports = {
  abc: '111',

  cccc: () => {
    return new Aclub();
  }
}