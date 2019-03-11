import { EventEmitter } from 'events';

export default class Test extends EventEmitter {
  test() {
    return this.on('test', {});
  }
}
