'use strict';

var express = require('express');
var app = express();
app.set('view engine', 'pug');
app.set('debug', app.get('env') !== 'production');
app.disable('x-powered-by');

app.use(function(req, res, next) {
  if(app.get('debug')) {
    console.error('[%s] %s %s', new Date().toLocaleString(), req.method, req.originalUrl);
  }
  next();
});

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/pac/:alias*?', function (req, res) {
  let host = req.params.alias || '127.0.0.1';
  if(!isNaN(host)) {
    host = '192.168.1.' + host;
  }
  let socks = req.headers['user-agent'].indexOf('CFNetwork') === -1 ? 'SOCKS5' : 'SOCKS';
  let profile = req.query['p'] || 'black';
  let output = require('fs').readFileSync(`views/${profile}.pac`);
  let interpolate = new Function('host', 'socks',
        'return `' + output + '`');
  let contentType = !req.query['v'] ? "application/x-ns-proxy-autoconfig" : "text/plain";
  res.header("Content-Type", contentType);
  res.end(interpolate(host, socks));
});

app.get('/qr', function(req, res) {
  let text = req.query.text;

  // 同域的请求 text 为空时，使用 referrer
  let errorMsg = '', referrer = req.get('Referrer');
  let topDomain = req.hostname.replace(/.*?(?=\w+\.\w+$)/g, '');
  if(!text && referrer && new RegExp('https?://(\\w+\\.)*(' + topDomain + '|brook.dev)(?=/|:)').test(referrer)) {
    var detector = (function(ua) {
      return {
        mobile: function() {
          return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(ua)
        }
      }
    })(req.headers['user-agent']);
    if(req.query['desktop-only'] && detector.mobile()) {
      res.type('gif');
      res.end(new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
    } else {
      const querystring = require('querystring');
      req.query.text = referrer;
      res.redirect('?' + querystring.stringify(req.query));
    }
    return;
  }

  var options = {
    size: 200,
    type: 'svg',
    margin: 10
  };
  for(var option in options) {
    if(req.query[option]) {
      options[option] = req.query[option];
    }
  }
  res.type(options.type);
  if(!text) {
    res.end(
`<svg xmlns="http://www.w3.org/2000/svg" width="${options.size}" height="${options.size}" viewBox="0 0 ${options.size} ${options.size}">
  <text x="50%" y="50%" text-anchor="middle">${errorMsg || 'Missing parameter text'}</text>
</svg>`
    );
    return;
  }

  var qr = require('qr-image');
  res.setHeader('Cache-Control', 'public, max-age=31557600');
  options.size = options.size / 21;
  options.margin = options.margin / 10;
  var qrImage = qr.image(text, options);
  qrImage.pipe(res);
});

app.listen(3333, function () {
  console.log('Site started!');
});
