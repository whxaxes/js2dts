exports.MyTest = class {
  constructor() {}

  /**
   * 1111
   * @param {Object} opt 
   * @param {String} opt.a 123
   * @param {String} [opt.b] 123
   * @param {Array<String|Number>} [opt.cc] 123
   * @param {Array<Array<String>|Number>|Number} [opt.dd] 123
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

  /**
   * @typedef FnObj
   * @property {String} FnObj.a asd
   * @property {Object} [FnObj.b] asd
   * @property {Number} FnObj.b.c asd
   * @property {() => {}} FnObj.b.d asd
   * @property {Promise<String>} FnObj.b.e asd
   * @property {Boolean|String} FnObj.b.f asd
   * @property {Array<Boolean>} [FnObj.b.g] asd
   * @property {Array<Array<boolean|String>>} [FnObj.b.h] asd
   * @property {Object} [FnObj.b.i] asd
   * @property {String} [FnObj.b.i.a] asd
   */

  /**
  * @param {FnObj} opt 123
  */
  fn6(opt) {
    return opt;
  }
}

/** @type {{ [key: string]: string }} */
exports.bbb = {};

/** @private */
exports.aaa = {};
