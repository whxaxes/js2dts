import * as object from './index';
import * as assert from 'assert';

object.aaaa.trim();
object.test.toFixed();
object.test2().trim();
object.test3().toFixed();
object.test4('123123').then(result => result.trim());
object.test5().then(result => result.trim());
object.test6()(123123).toFixed();

const test = object.test7('123');
test.ccc.toFixed();
assert(test.n === '123');
test.test().trim();
test.test2().toFixed();

object.test8().ctime.getFullYear();
object.test9().trim();
