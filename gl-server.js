var express	= require('express');
var app	= express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(cors());
var mongoose = require('mongoose');
//---- Replace with real credentials -------
//mongoose.connect('mongodb://<dbuser>:<dbpassword>@mongodb_instance');
mongoose.connect('mongodb://wlsdbuser:~resuBdslw@ds057244.mongolab.com:57244/wls-db');
//---- Local dev instance
//mongoose.connect('mongodb://localhost/narrations');

var Listing = require('./models/listing');

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
	Listing.find().
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
	Listing.find().
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
	Listing.findById(req.params.narration_id, function(err, narration) {
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
	Listing.find(realQuery)
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
	Listing.find(query)
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
		narration = new Listing();

console.log('req body', req.body);
	narration.title = data.title;
	narration.image = data.image;

	narration.save(function (err) {
		if(err) {
			res.send(err);
		}
		res.json({message: 'Listing Created'});
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
