import * as MyTest from './';

const m = new MyTest({
  name: '123',
});

m.on('asd', () => {});

const mm = new MyTest.MyTest({
  name: '123',
});

mm.on('ad', () => {});
