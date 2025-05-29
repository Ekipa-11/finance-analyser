var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BudgetSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    month: Number,
    year: Number,
    income: Number,
    expenses: Number,
    created_at: Date,
    updated_at: Date,
});

BudgetSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id; // Remove _id field
        delete ret.__v; // Remove __v field
    },
});

module.exports = mongoose.model("Budget", BudgetSchema);
