const methods = require('methods');
module.exports = class Router {
  constructor() {
    this.routers = [];
    this.init();
  }
  init() {
    methods.forEach(item => {
      this[item] = (path, handler) => {
        this.routers.push({
          path,
          method: item.toLocaleUpperCase(),
          handler
        });
      };
    });
  }
  
  routes() {
    const dispatch = (ctx, next) => {
      const headers = ctx.request.headers;
      this.routers.forEach(item => {
        if (item.path === headers[':path'] && item.method === headers[':method']) {
          item.handler(ctx, next);
        }
      });
      next();
    };
    return dispatch;
  }
};