import { formatName } from '../dist/util';

describe('util.test.ts', () => {
  describe.only('formatName', () => {
    it('should format normal package names properly', () => {
      expect(formatName('JS2DTS')).toEqual('JS2DTS');
      expect(formatName('js2dts')).toEqual('js2dts');
      expect(formatName('did-util')).toEqual('didUtil');
    });

    it('should format scoped package names properly', () => {
      expect(formatName('@xmark/core')).toEqual('XmarkCore');
      expect(formatName('@xmark/transform-landing-page')).toEqual('XmarkTransformLandingPage');
    });
  });
});
