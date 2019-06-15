const Litchi = require('../lib/application');
const app = new Litchi();
app.use((ctx, next) => {
  // ctx.setHeader('Access-Control-Allow-Origin', '*')
  // ctx.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  // ctx.setHeader('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  ctx.header['Access-Control-Allow-Origin'] = '*';
  ctx.header['Access-Control-Allow-Methods'] = 'PUT,POST,GET,DELETE,OPTIONS';
  ctx.header['Access-Control-Allow-Headers'] = 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With';
  // ctx.header = {
  //   'Access-Control-Allow-Origin': '*',
  //   'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
  //   'Access-Control-Allow-Headers': 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
  // };
  next();
});
app.use((ctx, next) => {
  // const path = ctx.headers[':path'];
  ctx.body = JSON.stringify(ctx.headers);
  next();
});

app.listen('8080');