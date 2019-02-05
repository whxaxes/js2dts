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

async function checkDts(file: string) {
  const dir = path.resolve(__dirname, './fixtures', file);
  const jsFile = path.resolve(dir, 'index');
  const result = create(`${jsFile}.js`)!;
  const code = result.toString();
  const tscFile = require.resolve('typescript/bin/tsc');
  fs.writeFileSync(path.resolve(dir, 'tsconfig.json'), tsconfigPlain);
  fs.writeFileSync(`${jsFile}.d.ts`, code);
  await coffeeWork(coffee.fork(tscFile, [ '-p', path.resolve(dir, 'tsconfig.json') ]));
  const checkerTs = path.resolve(dir, 'check.js');
  if (fs.existsSync(checkerTs)) {
    await coffeeWork(coffee.fork(path.resolve(dir, 'check.js')));
  }
}

test('normal#object', async () => {
  await checkDts('normal/object');
});

test('normal#function', async () => {
  await checkDts('normal/function');
});
