const Router = require('../lib/router');
const router = new Router();
router.get('/', (ctx) => {
  ctx.body = 'this get！';
});
router.post('/', (ctx) => {
  ctx.body = 'this post!';
});
module.exports = router;