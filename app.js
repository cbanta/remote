
/**
 * Module dependencies
 */

var express = require('express');
var  morgan = require('morgan');
var  bodyParser = require('body-parser');
var  methodOverride = require('method-override');
var  serveStatic = require('serve-static');
var  errorhandler = require('errorhandler');
var  multer = require('multer');
var  routes = require('./routes');
var  api = require('./routes/api');
var  http = require('http');
var  path = require('path');


var app = module.exports = express();


var uploadStorage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, 'upload.mp4');
  }
});
var upload = multer({storage:uploadStorage});

/**
* Configuration
*/

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(serveStatic(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));


// development only
if (app.get('env') === 'development') {
   app.use(errorhandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
}



// Routes
app.use(function(req,res,next){
	app.locals.base=(req.get('X-Prefix') || '');
	next();
});
app.get('/', routes.index);
app.get('/partial/:name', routes.partial);

// JSON API
app.get('/api/config', api.config);
app.get('/api/page/:id', api.page);
app.get('/api/stream', api.streamList);
app.get('/api/stream/:name', api.streamList);
app.post('/api/upload', upload.single('file'), api.upload);
app.post('/api/play/:action', api.play);
app.post('/api/play', api.playDetails);
app.post('/api/script/:page_id/:group_id/:script_id/run', api.runScript);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/**
* Start Server
*/

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
