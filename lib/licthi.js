const http2 = require('http2');
const Emitter = require('events');
const util = require('util');
const Stream = require('stream');
const only = require('only');
const statuses = require('statuses');
const context = require('./context');
const request = require('./request');
const response = require('./response');
const compose = require('./compose');

module.exports = class Litchi extends Emitter {
  constructor() {
    super();
    this.options;
    this.proxy=false;
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.middlewares = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
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
   * Return JSON representation.
   * We only bother showing settings.
   *
   * @return {Object}
   * @api public
   */
  toJSON() {
    return only(this, [
      'subdomainOffset',
      'proxy',
      'env'
    ]);
  }
  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */

  inspect() {
    return this.toJSON();
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
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };
    return requestHandler;
  }
  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const handleResponse = () => respond(ctx);

    return fnMiddleware(ctx).then(handleResponse);

  }
  /**
   * Initialize a new context.
   *
   * @api private
   */

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.state = {};
    return context;
  }
};
/**
 * Response helper.
 */

function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) {return;}

  // if (!ctx.writable) return;

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    // if (!res.headersSent && isJSON(body)) {
    //   ctx.length = Buffer.byteLength(JSON.stringify(body));
    // }
    return res.end();
  }

  // status body
  if (null == body) {
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) {return res.end(body);}
  if ('string' == typeof body) {return res.end(body);}
  if (body instanceof Stream) {return body.pipe(res);}

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}