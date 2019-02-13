import { development, abb, other, abbb, cool, otherFn } from './';
import * as assert from 'assert';

development.fastReady.valueOf();
development.ignoreDirs.slice(0);
development.reloadOnDebug.valueOf();
development.watchDirs.slice(0);

abb();
other.toFixed();
abbb.toFixed();
cool.trim();
assert(otherFn().FSWatcher);
