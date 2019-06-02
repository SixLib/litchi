const Litchi = require('../lib/licthi');
const fs = require('fs');
const path = require('path');
const litchi = new Litchi();

litchi.options = {
  key: fs.readFileSync(
    path.resolve(__dirname, 'certificate/localhost-privkey.pem')
  ),
  cert: fs.readFileSync(
    path.resolve(__dirname, 'certificate/localhost-cert.pem')
  )
};
// cors
litchi.use((ctx, next) => {
  ctx.res.setHeader('Access-Control-Allow-Origin', '*');
  ctx.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS'); //设置方法
  next();
});
litchi.routers = [{
  method: 'POST',
  path: '/',
  handler: (ctx) => {

    ctx.res.end('index');
  }
}];
litchi.https('8080');