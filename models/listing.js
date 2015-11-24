var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListingSchema = new Schema ({
	title: String,
	image: String
});

module.exports = mongoose.model('Listing', ListingSchema);
