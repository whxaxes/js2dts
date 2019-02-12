exports.MyTest = class {
  constructor() {}

  /**
   * 1111
   * @param {Object} opt 
   * @param {String} opt.a 123
   * @param {String} [opt.b] 123
   */
  fn(opt) {
    return opt;
  }

  /**
   * @private
   */
  fn2() {}

  // test 123
  fn3() {}

  *fn4() {
    return '123123';
  }

  async fn5() {
    return this.fn();
  }
}

/** @type {{ [key: string]: string }} */
exports.bbb = {};

/** @private */
exports.aaa = {};
