// import fs from 'fs';
import path from 'path';
import { generate } from '../dist';

test('test', () => {
  const newCode = generate(path.resolve(__dirname, './fixtures/index.js'));
  console.info(newCode);
  // fs.writeFileSync(path.resolve(__dirname, './fixtures/index.d.ts'), newCode);
});
