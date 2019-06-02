const http2 = require('http2');
// const compose = require('./compose');

class Litchi {
  constructor() {
    this.options;
    this.routers = [];
    this.middlewares = [];
  }
  use(fn) {
    if (typeof fn !== 'function') {throw new TypeError('middleware must be a function!');}
    this.middleware.push(fn);
    return this;
  }
  /**
   * 初始化 litchi
   *
   * @memberof Litchi
   */
  https() {
    const server = http2.createSecureServer(this.options, (req, res) => {
      
      const method = req.headers[':method'];
      const path = req.headers[':path'];
      this.routers.forEach(item => {
        (method === item.method && path === item.path) ? (() => {
          const context = {
            setHeader: res.setHeader,
            writeHead: res.writeHead,
            req: req,
            res: res
          };
          context.res.setHeader('Access-Control-Allow-Origin', '*');
          context.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
          context.res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS'); //设置方法

          item.handler(context);
        })() : (() => {
          res.writeHead(404, {
            'Content-Type': 'text/plain'
          });
          res.end('404');
        })();
      });
      // res.setHeader('Content-Type', 'text/html');
      // res.setHeader('X-Foo', 'bar');
      // res.writeHead(200, {
      //   'Content-Type': 'text/plain'
      // });
    });
    server.listen(`${process.env.PORT || 8080}`);
  }
}
module.exports = Litchi;