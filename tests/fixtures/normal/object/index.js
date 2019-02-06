const fs = require('fs');
const path = require('path');

function testFn(bb = 123) {
  return bb * 2;
}

class BaseClass {
  test() {
    return '123';
  }
}

class TestClass extends BaseClass {
  constructor(n) {
    super();
    this.n = n;
    this.ccc = this.test2();
  }

  test2() {
    return 123;
  }
}

module.exports = {
  test: 123,
  aaaa: String(123123),

  test2: () => {
    return '123123';
  },

  test3: () => 123123,

  async test4(abc = '123123') {
    return abc;
  },

  /**
   * test
   * @returns {Promise<string>}
   */
  test5() {
    return new Promise(resolve => {
      resolve('123123')
    });
  },

  test6() {
    return testFn;
  },

  test7(str) {
    return new TestClass(str);
  },

  test8() {
    return fs.lstatSync(path.resolve(__dirname, './index.js'));
  }
};

module.exports.test9 = () => {
  return '132123123';
}
