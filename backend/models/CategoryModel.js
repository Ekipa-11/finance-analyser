var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var CategorySchema = new Schema({
	'name' : String,
	'created_at' : Date,
	'updated_at' : Date
});

CategorySchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		delete ret._id; // Remove _id field
		delete ret.__v; // Remove __v field
	}
});

module.exports = mongoose.model('Category', CategorySchema);
