import { KoaRouter, EggRouter } from './';

const router = new KoaRouter({ prefix: '/' });
router.redirect('/login', 'sign-in', 301);
router.route('route');
router.stack.slice(0);
router.param('user', () => {});
router.prefix('/test/').route('route');
router.use('/test', () => {}).use('/ttt', () => {});

const eggRouter = new EggRouter({}, {});
eggRouter.redirect('/login', 'sign-in', 301);
eggRouter.route('route');
eggRouter.stack.slice(0);
eggRouter.param('user', () => {});
eggRouter.prefix('/test/').route('route');
eggRouter.use('/test', () => {}).use('/ttt', () => {});
