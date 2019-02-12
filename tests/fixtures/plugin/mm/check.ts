import * as mm from './';

mm({}, 'fn', () => {});
mm.http.request('xxx', {}, {});
mm.https.requestError('/xxx', 'xxx', 'xxx');
mm.restore();
mm.error({}, 'xxx', 'xxx', {}, 123);
