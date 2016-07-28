'use strict';

var express = require('express');
var app = express();
app.set('view engine', 'pug');
app.locals.env = {
  debug: process.env.NODE_ENV !== 'production'
};

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/qr', function(req, res) {
  var qr = require('qr-image');
  var imageType = req.query.type || 'svg';
  res.type(imageType);
  let text = req.query.text || req.get('Referrer');
  if(!text) {
    res.send(
`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <text x="0" y="0" >Missing parameter text</text>
</svg>`
    ); res.end();
  }
  var qrImage = qr.image(text, { type: imageType, size: 100 });
  qrImage.pipe(res);
});

app.listen(3333, function () {
  console.log('Site started!');
});
