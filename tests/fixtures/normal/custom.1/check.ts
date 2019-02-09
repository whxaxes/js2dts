import { getJSDoc, util, mod, egg, Application, Agent } from './';
import * as assert from 'assert';

util.getSymbol({} as any);
getJSDoc({} as any);
mod.default().toFixed();

assert(egg);
assert(Application);
assert(Agent);
