import * as chokidar from 'chokidar';
import { FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
declare const obj: {
    test: number;
    aaaa: string;
    getFn(): Promise<{
        test: number;
        aaaa: string;
        getFn(): Promise<any>;
        bbb(): Promise<() => Promise<(a: string, bbb: EventEmitter, ccc: FSWatcher) => typeof chokidar>>;
    }>;
    bbb(): Promise<any>;
};
export = obj;
