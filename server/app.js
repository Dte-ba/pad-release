/**
 * Main application file
 */

'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pad = module.exports = {};
// the expressjs app
var app = pad.app = (0, _express2.default)();

// the repository manager
var manager = pad.epmManager = require('./components/epm-manager');
var empRest = require('./components/epm-rest');

// the config
var config = pad.config = require('./config/environment');

app.version = 'v6.2';
app.kernel = 'EPM';

var j = _path2.default.join(__dirname, '/../package.json');
if (_fs2.default.existsSync(j)) {
  try {
    var info = JSON.parse(_fs2.default.readFileSync(j, 'utf-8'));
    app.version = 'v' + info.version;
  } catch (e) {}
}

pad.startServer = function (ops) {

  ops = ops || {};
  var mode = ops.mode || process.env.PAD_MODE || 'server';
  app.set('pad-mode', mode);

  if (ops.env !== undefined) {
    process.env.NODE_ENV = ops.env;
  }

  // the promise for web and repository
  var defer = _q2.default.defer();

  var server = pad.server = require('http').createServer(app);

  // then configure the express
  // define the EPM routes
  // define the routes for the app
  require('./config/express').default(app);
  app.use('/epm', empRest());
  require('./routes').default(app);

  manager.get('local').progress(function (info) {

    defer.notify({
      msg: "Cargando los paquetes de contenido digital.",
      progress: info.progress
    });
  }).fail(function (err) {
    throw err;
  }).done(function () {
    // Start server
    server.listen(config.port, config.ip, function () {
      setTimeout(function () {
        defer.resolve();
      }, 500);
    });
  });

  return defer.promise;
};