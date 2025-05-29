var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    password: String,
    email: String,
    created_at: Date,
    updated_at: Date,
});

UserSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("User", UserSchema);
