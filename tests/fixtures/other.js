const chokidar = require('chokidar');

class Abc {
  test() {
    return chokidar.watch('./');
  }
}

module.exports = () => {
  return new Abc();
}