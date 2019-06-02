const http2 = require('http2');
const compose = require('./compose');

class Litchi {
  constructor() {
    this.options;
    this.routers = [];
    this.middlewares = [];
  }
  use(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!');
    }
    this.middlewares.push(fn);
    return this;
  }
  /**
   * 初始化 litchi
   *
   * @memberof Litchi
   */
  https(...args) {
    const server = http2.createSecureServer(this.options, this.onRequestHandler());
    server.listen(...args);
  }
  /**
   *
   *
   * @param {*} fnMiddleware
   * @returns
   * @memberof Litchi
   */
  onRequestHandler() {
    const fn = compose(this.middlewares);

    const requestHandler = (req, res) => {
      const ctx = {
        app: this,
        setHeader: res.setHeader,
        writeHead: res.writeHead,
        req: req,
        res: res
      };
      return this.handleRequest(ctx, fn);
    };
    return requestHandler;
  }
  handleRequest(ctx, fnMiddleware) {
    const handleResponse = () => {
      ctx.res.end();
    };

    return fnMiddleware(ctx).then(handleResponse);
    // const method = req.headers[':method'];
    // const path = req.headers[':path'];
    // this.routers.forEach(item => {
    //   (method === item.method && path === item.path) ? (() => {


    //     item.handler(context);
    //   })() : (() => {
    //     res.writeHead(404, {
    //       'Content-Type': 'text/plain'
    //     });
    //     res.end('404');
    //   })();
    // });
  }
}
module.exports = Litchi;