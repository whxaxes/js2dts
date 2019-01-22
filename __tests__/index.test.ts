import path from 'path';
import { generate } from '../dist/checker';

test('test', () => {
  const newCode = generate(path.resolve(__dirname, './fixtures/index.js'));
  console.info(newCode);
});
