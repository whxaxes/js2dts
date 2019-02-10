import coffee from 'coffee';
import path from 'path';
import fs from 'fs';

describe('bin.test.ts', () => {
  const binPath = require.resolve('../dist/bin');

  it('should works with -h correctly', async () => {
    return coffee.fork(binPath, [ '-h' ])
      // .debug()
      .expect('stdout', /Usage/)
      .expect('stdout', /--dist \[path]/)
      .expect('code', 0)
      .end();
  });

  it('should works with -t correctly', async () => {
    return coffee.fork(binPath, [ path.resolve(__dirname, './fixtures/bin/test.js'), '-t' ])
      // .debug()
      .expect('stdout', /a: number;/)
      .expect('stdout', /b: string;/)
      .expect('code', 0)
      .end();
  });

  it('should write file correctly', async () => {
    await coffee.fork(binPath, [ path.resolve(__dirname, './fixtures/bin/test.js') ])
      // .debug()
      .expect('code', 0)
      .end();

    fs.existsSync(path.resolve(__dirname, './fixtures/bin/test.d.ts'));
  });

  it('should work with -d dir correctly', async () => {
    await coffee.fork(binPath, [
      './fixtures/bin/test.js',
      '-d',
      './fixtures/bin/output/',
    ], { cwd: __dirname })
      // .debug()
      .expect('code', 0)
      .end();

    fs.existsSync(path.resolve(__dirname, './fixtures/bin/output/test.d.ts'));
  });

  it('should work with -d file correctly', async () => {
    await coffee.fork(binPath, [
      './fixtures/bin/test.js',
      '-d',
      path.resolve(__dirname, './fixtures/bin/output/other.d.ts'),
    ], { cwd: __dirname })
      // .debug()
      .expect('code', 0)
      .end();

    fs.existsSync(path.resolve(__dirname, './fixtures/bin/output/other.d.ts'));
  });
});
