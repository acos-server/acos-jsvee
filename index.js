var fs = require('fs');
var htmlencode = require('htmlencode').htmlEncode;

var JSVEE = function() {};

JSVEE.addToHead = function(params) {
  return '<link href="/static/jsvee/jsvee.css" rel="stylesheet">\n' +
    '<script src="/static/jsvee/jquery.min.js" type="text/javascript"></script>\n' +
    '<script src="/static/jsvee/JSVEE-min.js" type="text/javascript"></script>\n';
};

JSVEE.addToBody = function(params, handlers, req) {

  var startLine = '';
  if (req.query.startline) {
    startLine = ' data-jsvee-startline="' + htmlencode(req.query.startline) + '"';
  }

  var kelmu = '';
  if (handlers.libraries.kelmu) {
    kelmu = ' kelmu';
  }

  return '<div class="jsvee-animation' + kelmu + '" data-id="' + htmlencode(params.name) + '"' + startLine + '></div>';

};

JSVEE.initialize = function(req, params, handlers, cb) {

  // Initialize the content type
  params.headContent += JSVEE.addToHead(params);
  params.bodyContent += JSVEE.addToBody(params, handlers, req);

  // Initialize the content package
  handlers.contentPackages[req.params.contentPackage].initialize(req, params, handlers, function() {
    if (handlers.libraries.kelmu) {
      handlers.libraries.kelmu.initialize(req, params, handlers, cb);
    } else {
      cb();
    }
  });
};

JSVEE.handleEvent = function(event, payload, req, res, protocolPayload, responseObj, cb) {
  if (event == 'log') {
    var dir = JSVEE.config.logDirectory + '/jsvee/' + req.params.contentPackage;
    fs.mkdir(dir, 0775, function(err) {
      var name = payload.animationId.replace(/\.|\/|\\|~/g, "-") + '.log';
      var data = new Date().toISOString() + ' ' + payload.logId + ' ' + JSON.stringify(payload.log) + ' ' + JSON.stringify(protocolPayload || {}) + '\n';
      fs.writeFile(dir + '/' + name, data, { flag: 'a' }, function(err) {
        cb(event, payload, req, res, protocolPayload, responseObj);
      });
    });
  } else {
    cb(event, payload, req, res, protocolPayload, responseObj);
  }
};

JSVEE.register = function(handlers, app, conf) {
  handlers.contentTypes.jsvee = JSVEE;
  fs.mkdir(conf.logDirectory + '/jsvee', 0775, function(err) {});
  JSVEE.config = conf;
};

JSVEE.namespace = 'jsvee';
JSVEE.installedContentPackages = [];
JSVEE.packageType = 'content-type';

JSVEE.meta = {
  'name': 'jsvee',
  'shortDescription': 'Content type for JSVEE program execution visualizations.',
  'description': '',
  'author': 'Teemu Sirkiä',
  'license': 'MIT',
  'version': '0.2.1',
  'url': ''
};

module.exports = JSVEE;
