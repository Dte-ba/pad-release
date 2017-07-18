/**
 * Main application routes
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {
  // Insert routes below
  app.use('/api/design', require('./api/design'));

  var mode = 'server';
  if (process.env.PAD_MODE) {
    mode = process.env.PAD_MODE;
  }

  // make open for desktop apps
  if (mode === 'desktop') {
    app.route('/open').post(function (req, res) {
      var p = req.query.path;
      (0, _open2.default)(p);
      res.json({});
    });
  }

  // add application information
  app.route('/api/info').get(function (req, res) {
    res.json({
      version: app.version,
      kernel: app.kernel,
      mode: mode,
      repository: process.env.REPOSITORY_PATH
    });
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(_errors2.default[404]);

  // All other routes should redirect to the index.html
  app.route('/*').get(function (req, res) {
    res.sendFile(_path2.default.resolve(app.get('appPath') + '/index.html'));
  });
};

var _errors = require('./components/errors');

var _errors2 = _interopRequireDefault(_errors);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _open = require('open');

var _open2 = _interopRequireDefault(_open);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }