import fs from 'fs';
import path from 'path';
import coffee from 'coffee';
import { create } from '../dist';
const tsconfigPlain = JSON.stringify({
  compilerOptions: {
    strict: true,
    target: 'es2017',
    module: 'commonjs',
    moduleResolution: 'node',
  },
}, null, 2);

function coffeeWork(task: coffee.Coffee) {
  return task
    .debug()
    .expect('code', 0)
    .end();
}

async function checkDts(file: string, execute: boolean = true) {
  const dir = path.resolve(__dirname, './fixtures', file);
  const jsFile = path.resolve(dir, 'index');
  const result = create(`${jsFile}.js`)!;
  const code = result.toString();
  const tscFile = require.resolve('typescript/bin/tsc');
  fs.writeFileSync(path.resolve(dir, 'tsconfig.json'), tsconfigPlain);
  fs.writeFileSync(`${jsFile}.d.ts`, code);
  await coffeeWork(coffee.fork(tscFile, [ '-p', path.resolve(dir, 'tsconfig.json') ], { execArgv: [] }));
  const checkerTs = path.resolve(dir, 'check.js');
  if (fs.existsSync(checkerTs) && execute) {
    await coffeeWork(coffee.fork(path.resolve(dir, 'check.js'), [], { execArgv: [] }));
  }
  return code;
}

describe('index.test.ts', () => {
  describe('normal', () => {
    it('normal#object', async () => {
      await checkDts('normal/object');
    });

    it('normal#function', async () => {
      await checkDts('normal/function');
    });

    it('normal#function.1', async () => {
      await checkDts('normal/function.1');
    });

    it('normal#class', async () => {
      await checkDts('normal/class');
    });

    it('normal#exports', async () => {
      await checkDts('normal/exports');
    });

    it('normal#custom', async () => {
      await checkDts('normal/custom');
    });

    it('normal#prototype', async () => {
      await checkDts('normal/prototype');
    });

    it('normal#prototype.1', async () => {
      await checkDts('normal/prototype.1');
    });
  });

  describe('plugin', () => {
    it('plugin#egg-router', async () => {
      await checkDts('plugin/egg-router', false);
    });

    it('plugin#mus', async () => {
      await checkDts('plugin/mus', false);
    });
  });
});
