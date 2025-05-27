const TransactionModel = require("../models/TransactionModel.js");

/**
 * TransactionController.js
 *
 * @description :: Server-side logic for managing Transactions.
 */
/**
 * TransactionController.list()
 */
async function list(req, res) {
    try {
        const Transactions = await TransactionModel.find({ user_id: req.user.id });
        return res.json(Transactions);
    } catch (err) {
        return res.status(500).json({
            message: "Error when getting Transaction.",
            error: err,
        });
    }
}

/**
 * TransactionController.show()
 */
async function show(req, res) {
    const id = req.params.id;
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });

        const Transaction = await TransactionModel.findOne({ _id: id });
        if (!Transaction) return res.status(404).json({ message: "No such Transaction" });

        return res.json(Transaction);
    } catch (err) {
        return res.status(500).json({ message: "Error when getting Transaction.", error: err });
    }
}

/**
 * TransactionController.create()
 */
async function create(req, res) {
    // Check if every required field is present
    if (!req.body) return res.status(400).json({ message: "Request body is missing" });

    if (!req.body.amount || !req.body.category || !req.body.description || !req.body.type)
        return res.status(400).json({ message: "Missing required fields. All fields: amount, category, description, type" });

    if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });

    const Transaction = new TransactionModel({
        amount: req.body.amount,
        date: req.body.date || new Date(),
        type: req.body.type || "expense",
        category: req.body.category,
        description: req.body.description,
        created_at: new Date(),
        updated_at: new Date(),

        user_id: req.user.id,
    });

    try {
        const savedTransaction = await Transaction.save();
        return res.status(201).json(savedTransaction);
    } catch (err) {
        return res.status(500).json({ message: "Error when creating Transaction", error: err });
    }
}

/**
 * TransactionController.update()
 */
async function update(req, res) {
    const id = req.params.id;
    try {
        const Transaction = await TransactionModel.findOne({ _id: id });
        if (!Transaction) return res.status(404).json({ message: "No such Transaction" });

        Transaction.id = req.body.id ? req.body.id : Transaction.id;
        Transaction.amount = req.body.amount ? req.body.amount : Transaction.amount;
        Transaction.date = req.body.date ? req.body.date : Transaction.date;
        Transaction.category = req.body.category ? req.body.category : Transaction.category;
        Transaction.description = req.body.description ? req.body.description : Transaction.description;
        Transaction.created_at = req.body.created_at ? req.body.created_at : Transaction.created_at;
        Transaction.updated_at = req.body.updated_at ? req.body.updated_at : Transaction.updated_at;

        const updatedTransaction = await Transaction.save();
        return res.json(updatedTransaction);
    } catch (err) {
        return res.status(500).json({ message: "Error when updating Transaction.", error: err });
    }
}

/**
 * TransactionController.remove()
 */
async function remove(req, res) {
    const id = req.params.id;
    try {
        const transaction = await TransactionModel.findById(id);

        if (!transaction) return res.status(404).json({ message: "No such Transaction" });
        if (transaction.user_id.toString() !== req.user.id)
            return res.status(403).json({ message: "Forbidden: You can only delete your own transactions" });

        await TransactionModel.findByIdAndRemove(id);
        return res.status(204).json();
    } catch (err) {
        return res.status(500).json({ message: "Error when deleting the Transaction.", error: err });
    }
}
module.exports = { list, show, create, update, remove };
