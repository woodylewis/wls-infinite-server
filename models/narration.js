var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NarrationSchema = new Schema ({
	body: String,
	category: String,
	date: Date,
	title: String,
	url: String
});

module.exports = mongoose.model('Narration', NarrationSchema);
