var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["income", "expense"],
        required: true,
    },
    amount: Number,
    date: Date,
    category: String,
    description: String,
    created_at: Date,
    updated_at: Date,
});

TransactionSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
