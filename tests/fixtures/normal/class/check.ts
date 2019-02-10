import MyTest = require('./');

const myTest = new MyTest({ name: '123' });
myTest.on('check', () => {});
myTest.emit('check');
myTest.opt.name.trim();
myTest.getCount().toFixed();

const myTest2 = MyTest.getInstance({ name: '123' });
myTest2.getCount().toFixed();
