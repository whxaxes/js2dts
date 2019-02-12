import { abc, getJSDoc, util, mod, egg, Application, Agent } from './';
import * as assert from 'assert';

util.getSymbol({} as any);
getJSDoc({} as any);
mod.default().toFixed();
abc.trim();

assert(egg);
assert(Application);
assert(Agent);
