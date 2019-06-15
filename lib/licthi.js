const http2 = require('http2');
const fs = require('fs');
const util = require('util');
const Emitter = require('events');
const compose = require('./compose');
const context = require('./context');

class Litchi extends Emitter {

  constructor() {
    super();
    this.privkey = 'certificate/localhost-privkey.pem';
    this.cert = 'certificate/localhost-cert.pem';
    this.context = Object.create(context);
    this.middlewares = [];
  }
  listen(...args) {
    const server = http2.createSecureServer({
      key: fs.readFileSync(this.privkey),
      cert: fs.readFileSync(this.cert)
    });
    server.on('error', (err) => console.error(err));

    server.on('stream', this.streamCallback()
      //  (stream) => {
      //   stream.respond({
      //     ':status': 200,
      //     "Access-Control-Allow-Origin": "*",
      //     "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
      //     "Access-Control-Allow-Headers": "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
      //   });
      //   console.log(stream)
      //   stream.end('some data');
      // }
    );

    return server.listen(...args);
  }
  /**
   * 插入中间件
   * 
   * @param {*} fn(中间件函数)
   * @returns this
   * @memberof Litchi
   */
  use(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!');
    }
    this.middlewares.push(fn);
    return this;
  }

  streamCallback() {
    const fn = compose(this.middlewares);
    if (!this.listenerCount('error')) {
      this.on('error', this.onerror);
    }
    const handleRequest = (...args) => {

      return this.handleRequest(...args, fn);
    };

    return handleRequest;
  }
  handleRequest(stream, headers, flags, rawHeaders, fnMiddleware) {
    const ctx = Object.create(this.context);

    ctx.stream = stream;
    ctx.headers = headers;
    ctx.flags = flags;
    ctx.rawHeaders = rawHeaders;

    const handleResponse = () => respond(ctx);
    return fnMiddleware(ctx).then(handleResponse);
  }
  onerror(err) {
    if (!(err instanceof Error)) {
      throw new TypeError(util.format('non-error thrown: %j', err));
    }

    if (404 == err.status || err.expose) {
      return;
    }
    if (this.silent) {
      return;
    }

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
}
const respond = (ctx) => {
  if (ctx.header) {
    ctx.stream.respond(ctx.header);
  }
  ctx.stream.end(ctx.body);
};
module.exports = Litchi;