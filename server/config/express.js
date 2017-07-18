/**
 * Express configuration
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {
  var env = app.get('env');
  var mode = app.get('pad-mode');

  if (env === 'development' || env === 'test') {
    app.use(_express2.default.static(_path2.default.join(_environment2.default.root, '.tmp')));
  }

  if (env === 'production') {
    app.use((0, _serveFavicon2.default)(_path2.default.join(_environment2.default.root, 'client', 'favicon.ico')));
  }

  app.set('appPath', _path2.default.join(_environment2.default.root, 'client'));
  app.use(_express2.default.static(app.get('appPath')));
  app.use((0, _morgan2.default)('dev'));

  app.set('views', _environment2.default.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(_bodyParser2.default.urlencoded({ extended: false }));
  app.use(_bodyParser2.default.json());
  app.use((0, _methodOverride2.default)());
  app.use((0, _cookieParser2.default)());

  if (env === 'development' && mode !== 'desktop') {
    var webpackDevMiddleware = require('webpack-dev-middleware');
    var stripAnsi = require('strip-ansi');
    var webpack = require('webpack');
    var makeWebpackConfig = require(_path2.default.resolve(__dirname, '../../webpack.make'));
    var webpackConfig = makeWebpackConfig({ DEV: true });
    var compiler = webpack(webpackConfig);
    var browserSync = require('browser-sync').create();

    /**
     * Run Browsersync and use middleware for Hot Module Replacement
     */
    browserSync.init({
      open: false,
      logFileChanges: false,
      proxy: 'localhost:' + _environment2.default.port,
      ws: true,
      middleware: [webpackDevMiddleware(compiler, {
        noInfo: false,
        stats: {
          colors: true,
          timings: true,
          chunks: false
        }
      })],
      port: _environment2.default.browserSyncPort,
      plugins: ['bs-fullscreen-message']
    });

    /**
     * Reload all devices when bundle is complete
     * or send a fullscreen error message to the browser instead
     */
    compiler.plugin('done', function (stats) {
      console.log('webpack done hook');
      if (stats.hasErrors() || stats.hasWarnings()) {
        return browserSync.sockets.emit('fullscreen:message', {
          title: 'Webpack Error:',
          body: stripAnsi(stats.toString()),
          timeout: 100000
        });
      }
      browserSync.reload();
    });
  }

  if (env === 'development' || env === 'test') {
    app.use((0, _errorhandler2.default)()); // Error handler - has to be last
  }
};

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }