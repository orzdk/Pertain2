var http = require('http'),
    ss = require('socketstream');

ss.client.define('main', {
  view: 'canvas.html',
  css:  ['libs/reset.css', 'app.styl'],
  code: ['libs/jquery.min.js', 'libs/buzz.js','libs/three.min.js','libs/Bird.js','libs/stats.min.js','libs/pertainlib.js','libs/pertainmedia.js','app'],
  tmpl: '*'
});

ss.http.route('/', function(req, res){
  res.serveClient('main');
});

ss.client.formatters.add(require('ss-stylus'));
ss.client.templateEngine.use(require('ss-hogan'));

if (ss.env === 'production') ss.client.packAssets();

var server = http.Server(ss.http.middleware);
server.listen(8125);

ss.start(server);
