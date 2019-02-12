import * as urllib from './';
import u from './';
import * as assert from 'assert';

assert(u.TIMEOUT);
assert(u.USER_AGENT);

u.curl('/xxx', {}, () => {});
u.request('/xxxx', {}, () => {});

urllib.curl('/xxx', {}, () => {});
urllib.create({}).curl('/xxx', {}, () => {});

const client = new urllib.HttpClient({});
client.curl('/xxx', {}, () => {});
client.request('/xxx', {}, () => {});

const client2 = new urllib.HttpClient2({});
client2.curl('/xxx', {});
client2.request('/xxx', {});
