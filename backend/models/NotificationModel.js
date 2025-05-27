var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var NotificationSchema = new Schema({
	'user_id' : {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	'message' : String,
	'type' : String,
	'read' : Boolean,
	'created_at' : Date,
	'updated_at' : Date
});

NotificationSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		delete ret._id; // Remove _id field
		delete ret.__v; // Remove __v field
	}
});

module.exports = mongoose.model('Notification', NotificationSchema);
