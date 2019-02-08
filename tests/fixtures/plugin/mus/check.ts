import * as mus from './';

mus.utils.parser.parseAttr('xx', 'xxx').bind(undefined);
mus.utils.processor.else({});
mus.customTags.set('dd', 123);
const ast = mus.getAst('sss', 'sss');
const c = new mus.Compiler({ ast, scope: {}, ecomp: {} });
c.processAst({}, {});
ast.blockStart.trim();
const evt = new mus.utils.constant.EventEmitter();
evt.on('asd', () => {});
const m = new mus.Mus({});
m.configure({});
