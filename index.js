var express = require('express');
var app = express();
app.set('view engine', 'pug');
app.locals.env = {
  debug: process.env.NODE_ENV !== 'production'
};

app.get('/', function (req, res) {
  res.render('index');
});

app.listen(3333, function () {
  console.log('Site started!');
});
