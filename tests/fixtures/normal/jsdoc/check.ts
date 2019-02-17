import * as obj from './';

const t = new obj.MyTest();
t.fn({ a: '123' }).a.trim();
t.fn3();
t.fn4().next();
t.fn5().then(() => {});
t.fn6({
  a: '123123',
});
t.fn6({
  a: '123123',
  b: {
    c: 123123,
    d: () => ({}),
    e: (async () => '123')(),
    f: true,
  },
});
t.fn6({
  a: '123123',
  b: {
    c: 123123,
    d: () => ({}),
    e: (async () => '123')(),
    f: true,
    g: [ true ],
    h: [[ '123', true ]],
    i: {
      a: '123',
    },
  },
});
