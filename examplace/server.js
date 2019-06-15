const Litchi = require('../lib/licthi');
const app = new Litchi();
app.use((ctx, next) => {
  ctx.header = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
  };
  next();
});
app.use((ctx, next) => {
  const path = ctx.headers[':path'];
  ctx.body = path;
  next();
});

app.listen('8080');