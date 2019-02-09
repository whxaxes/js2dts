import { EggCore, EggLoader, utils, BaseContextClass } from './';

const eggCore = new EggCore();
eggCore.loader.eggPaths.slice(0);
eggCore.ready(() => {});
eggCore.url('/xxx', {}).trim();
eggCore.baseDir.trim();

const loader = new EggLoader({
  baseDir: 'xxx',
  app: {},
  logger: {},
});
loader.eggPaths.slice(0);
loader.loadToApp('/xxxx', 'xxx', {});
loader.loadFile('xxxxx');

utils.loadFile('xxxxx');
utils.methods.slice(0);

const obj = new BaseContextClass({});
console.info(obj.config);
console.info(obj.app);
console.info(obj.service);
console.info(obj.ctx);
