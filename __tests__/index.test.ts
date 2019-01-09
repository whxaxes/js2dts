import fs from 'fs';
import path from 'path';
import { generate } from '../dist';

test('test', () => {
  const code = fs.readFileSync(path.resolve(__dirname, './fixtures/index.js'), {
    encoding: 'utf-8',
  });

  const newCode = generate(code);
  console.info(newCode);
});
