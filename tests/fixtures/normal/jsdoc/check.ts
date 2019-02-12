import * as obj from './';

const t = new obj.MyTest();
t.fn({ a: '123' }).a.trim();
t.fn3();
t.fn4().next();
t.fn5().then(() => {});
