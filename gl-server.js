var express	= require('express');
var app	= express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(cors());
var mongoose = require('mongoose');
//---- Replace with real credentials -------
//mongoose.connect('mongodb://<dbuser>:<dbpassword>@mongodb_instance');
//---- Local dev instance
mongoose.connect('mongodb://localhost/narrations');

var Narration = require('./models/narration');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = 7100;

var router = express.Router();

//----- LOG EVENTS ------------
router.use(function(req, res, next) {
	console.log('An Event');
	next();
});

//----- TEST ROUTE ------------
router.get('/', function(req, res, next){
	res.json({ message: 'NEW TEST RESPONSE'});
});

router.route('/narrations')
.get(function(req, res) {
	Narration.find().
			  sort('_id').
			  exec( function (err, narrations) {
			 	if(err) {
			 		res.send(err);
			 	}
			 	res.json(narrations);
			 });
});

router.route('/edit')
.get(function(req, res, next) {
	Narration.find().
			  sort('_id').
			  exec( function (err, narrations) {
			 	if(err) {
			 		res.send(err);
			 	}
			 	for(var i = 0; i < narrations.length; i++) {
			 		var n = narrations[i];
			 		console.log('n = ',n);
			 		n.category = narrations[i].category;
			 		n.body = narrations[i].body;
			 		n.date = narrations[i].date;
			 		n.url = 'narration-' + i;
			 		n.title = 'Title ' + i;
			 		n.save(function(err) {
			 			if(err)
			 				res.send(err);
			 			//res.json({message: 'edited'});
			 		});
			 	}
			 		res.json('DONE');
			 });
});

router.route('/narrations/:narration_id')
.get(function(req, res, next) {
	Narration.findById(req.params.narration_id, function(err, narration) {
		if(err) {
			res.send(err);
		}
		res.json(narration);
	});
});

router.route('/narration-page/:narration_id')
.get(function(req, res, next) {
	var query = {};
	var field = '_id';
	var firstPass = {};
	var operator = {};
	operator['$lt'] = req.params.narration_id;
	query[field] = operator;
	var realQuery = (req.params.narration_id === 'n') ? firstPass[field] : query;
	Narration.find(realQuery)
			 .limit(30)
			 .sort({'_id' : -1})
			 .exec( function (err, narrations) {
			 	if(err) {
			 		res.send(err);
			 	}
			 	res.json(narrations);
			 });

});

router.route('/narration/:narration_url')
.get(function(req, res, next) {
	console.log('narration-url ', req.params.narration_url);
	var query = {};
	var field = 'url';
	var operator = {};
	operator['$eq'] = req.params.narration_url;
	query[field] = operator;
	Narration.find(query)
			 .limit(1)
			 .exec( function (err, narration) {
			 	if(err) {
			 		res.send(err);
			 	}
			 	res.json(narration);
			 });

});

router.route('/new') 
.post(function(req, res, next) {
	var data = req.body.data,
		narration = new Narration();

console.log('req body', req.body);
	narration.title = data.title;
	narration.url = data.url;
	narration.date = data.date;
	narration.body = data.body;
	narration.category = data.category;

	narration.save(function (err) {
		if(err) {
			res.send(err);
		}
		res.json({message: 'Narration Created'});
	});

}), function(err) {
	if(err) {
		res.send(err);
	}
};

//----- REGISTER ROUTES ----------
app.use('/', router);

app.listen(port);
console.log('Listening on port ' + port);
