const Litchi = require('./lib/licthi');
const fs = require('fs');
const path = require('path');
const litchi = new Litchi();

litchi.options = {
  key: fs.readFileSync(
    path.resolve(__dirname, 'certificate/localhost-privkey.pem')
  ),
  cert: fs.readFileSync(
    path.resolve(__dirname, 'certificate/localhost-cert.pem')
  ),
  allowHTTP1:true
};
litchi.routers = [{
  method: 'POST',
  path: '/',
  handler: (ctx) => {

    ctx.res.end('index');
  }
}];
litchi.https('8080');