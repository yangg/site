'use strict';

var express = require('express');
var app = express();
app.set('view engine', 'pug');
app.set('debug', app.get('env') !== 'production');

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/qr', function(req, res) {
  var qr = require('qr-image');
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
  let text = req.query.text;

  // 同域的请求 text 为空时，使用 referrer
  let errorMsg = '', referrer = req.get('Referrer');
  let topDomain = req.hostname.replace(/.*?(?=\w+\.\w+$)/g, '');
  if(!text && referrer && new RegExp('https?://(\\w+\\.)*' + topDomain + '\\b').test(referrer)) {
    text = referrer;
  }
  if(!text) {
    res.send(
`<svg xmlns="http://www.w3.org/2000/svg" width="${options.size}" height="${options.size}" viewBox="0 0 ${options.size} ${options.size}">
  <text x="50%" y="50%" text-anchor="middle">${errorMsg || 'Missing parameter text'}</text>
</svg>`
    );
    res.end();
  }

  options.size = options.size / 21;
  options.margin = options.margin / 10;
  var qrImage = qr.image(text, options);
  qrImage.pipe(res);
});

app.listen(3333, function () {
  console.log('Site started!');
});
