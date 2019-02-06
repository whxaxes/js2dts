module.exports = superName;

/**
 * super function
 * 
 * @param {String} bbb 123123
 */
function superName(bbb, ccc = module.exports.test) {
  return '123123';
}

module.exports.test = () => 123123;
module.exports.test2 = {
  abc: 123,
};
