import Cookies = require('./');

const cookies = new Cookies({}, {}, {});

cookies.get('key', {});
cookies.set('key', {}, {});
const cookie = new Cookies.Cookie('aaa', {}, {});

cookie.path.trim();
cookie.httpOnly.valueOf();
cookie.sameSite.valueOf();
cookie.secure.valueOf();
