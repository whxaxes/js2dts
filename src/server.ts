import path from 'path';
import { fork } from 'child_process';
import { EventEmitter } from 'events';

let seq = 0;
const evt = new EventEmitter();
const tsserverPath = require.resolve('typescript/lib/tsserver.js');
const ps = fork(tsserverPath, [], {
  stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ],
  silent: true,
});

ps.stdout.on('data', message => {
  const str = message.toString();
  const info = str.split('\r\n').pop()!;
  const json = JSON.parse(info.trim());
  console.info('======\n\n');
  console.info(json);
  console.info('\n\n======');
  if (json.type === 'event') {
    evt.emit(json.event, json.body);
  }
});

function sendCommand(json) {
  json.seq = seq++;
  json.type = 'request';
  ps.stdin.write(JSON.stringify(json) + '\r\n');
}

const file = path.resolve(__dirname, '../__tests__/fixtures/index.js');
evt.once('typingsInstallerPid', () => {
  sendCommand({
    command: 'open',
    arguments: { file },
  });
});

evt.once('projectLoadingFinish', () => {
  sendCommand({
    command: 'quickinfo',
    arguments: {
      file,
      line: 3,
      offset: 7,
    },
  });
});
