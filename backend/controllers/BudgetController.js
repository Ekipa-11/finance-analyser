const BudgetModel = require("../models/BudgetModel.js");
const TransactionModel = require("../models/TransactionModel.js");

/**
 * BudgetController.js
 *
 * @description :: Server-side logic for managing Budgets.
 */

async function list(req, res) {
    try {
        // Check if the user ID is present
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        // Fetch all budgets for the user
        const Budgets = await BudgetModel.find({ user_id: req.user.id }).sort({ year: -1, month: -1 });
        if (!Budgets || Budgets.length === 0) return res.status(404).json({ message: "No Budgets found for this user" });
        const Transactions = await TransactionModel.find({ user_id: req.user.id }).sort({ date: -1 });
        // For each budget calculate actual income and expenses (that is, sum of all transactions for that month and year) and also income variance and expenses performance
        var BudgetsJSON = [];
        Budgets.forEach((budget) => {
            const budgetMonth = budget.month;
            const budgetYear = budget.year;
            const budgetIncome = budget.income;
            const budgetExpenses = budget.expenses;
            let actualIncome = 0;
            let actualExpenses = 0;
            Transactions.forEach((transaction) => {
                const transactionDate = new Date(transaction.date);
                if (transactionDate.getFullYear() === budgetYear && transactionDate.getMonth() + 1 === budgetMonth) {
                    if (transaction.type === "income") actualIncome += transaction.amount;
                    if (transaction.type === "expense") actualExpenses += transaction.amount;
                }
            });
            const incomeVariance = actualIncome - budgetIncome;
            const expensesPerformance = Number((budgetExpenses - actualExpenses).toFixed(2));
            BudgetsJSON.push({
                id: budget._id,
                month: budgetMonth,
                year: budgetYear,
                income: budgetIncome,
                expenses: budgetExpenses,
                actualIncome: actualIncome,
                actualExpenses: actualExpenses,
                incomeVariance: incomeVariance,
                expensesPerformance: expensesPerformance,
                created_at: budget.created_at,
                updated_at: budget.updated_at,
            });
        });
        // Sort budgets by year and month
        BudgetsJSON.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year; // Sort by year descending
            return b.month - a.month; // Sort by month descending
        });
        // Return the budgets as JSON
        console.log("Budgets[0]: ", BudgetsJSON[0]);
        return res.json(BudgetsJSON);
    } catch (err) {
        return res.status(500).json({ message: "Error when getting Budget.", error: err });
    }
}

async function show(req, res) {
    try {
        // Check if the user ID is present
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        // Fetch the budget by ID
        const Budget = await BudgetModel.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!Budget) return res.status(404).json({ message: "No such Budget for this user" });
        // Calculate actual income and expenses (that is, sum of all transactions for that month and year) and also income variance and expenses performance
        const budgetMonth = Budget.month;
        const budgetYear = Budget.year;
        const budgetIncome = Budget.income;
        const budgetExpenses = Budget.expenses;
        const Transactions = await TransactionModel.find({ user_id: req.user.id }).sort({ date: -1 });
        let actualIncome = 0;
        let actualExpenses = 0;
        Transactions.forEach((transaction) => {
            const transactionDate = new Date(transaction.date);
            if (transactionDate.getFullYear() === budgetYear && transactionDate.getMonth() + 1 === budgetMonth) {
                if (transaction.type === "income") actualIncome += transaction.amount;
                if (transaction.type === "expense") actualExpenses += transaction.amount;
            }
        });
        const incomeVariance = actualIncome - budgetIncome;
            const expensesPerformance = Number((budgetExpenses - actualExpenses).toFixed(2));
        const BudgetsJSON = {
            id: Budget._id,
            month: budgetMonth,
            year: budgetYear,
            income: budgetIncome,
            expenses: budgetExpenses,
            actualIncome: actualIncome,
            actualExpenses: actualExpenses,
            incomeVariance: incomeVariance,
            expensesPerformance: expensesPerformance,
            created_at: Budget.created_at,
            updated_at: Budget.updated_at,
        };
        return res.json(BudgetsJSON);
    } catch (err) {
        return res.status(500).json({ message: "Error when getting Budget.", error: err });
    }
}

async function create(req, res) {
    try {
        console.log(req.body);

        // Check if every required field is present (all are numbers)
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });

        if (!req.body || typeof req.body.income !== "number" || typeof req.body.expenses !== "number")
            return res.status(400).json({ message: "Missing required or NaN fields. All fields should be numbers: month, year, income, expenses" });

        // Check if month and year are provided, default to current month and year if not
        let month = req.body.month;
        let year = req.body.year;
        if (typeof req.body.month !== "number") month = new Date().getMonth() + 1;
        if (typeof req.body.year !== "number") year = new Date().getFullYear();

        // Check if the budget for the given month and year already exists for the user
        const existingBudget = await BudgetModel.findOne({
            month: month,
            year: year,
            user_id: req.user.id,
        });
        if (existingBudget) return res.status(409).json({ message: "Budget for this month and year already exists" });

        // Default to the current year and month if not provided
        const Budget = new BudgetModel({
            month: month,
            year: year,
            income: req.body.income,
            expenses: req.body.expenses,
            created_at: Date.now(),
            updated_at: Date.now(),
            user_id: req.user.id,
        });
        const savedBudget = await Budget.save();
        return res.status(201).json(savedBudget);
    } catch (err) {
        return res.status(500).json({ message: "Error when creating Budget", error: err });
    }
}

async function update(req, res) {
    try {
        // Check if the request body is present
        if (!req.body) return res.status(400).json({ message: "Request body is missing" });
        // Check if the user ID is present
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });

        const Budget = await BudgetModel.findOne({ _id: req.params.id });
        if (!Budget) return res.status(404).json({ message: "No such Budget" });
        // Check if the user is authorized to update this budget
        if (Budget.user_id.toString() !== req.user.id) return res.status(403).json({ message: "You are not authorized to update this budget" });

        Budget.month = typeof req.body.month !== "number" ? req.body.month : Budget.month;
        Budget.year = typeof req.body.year !== "number" ? req.body.year : Budget.year;
        Budget.income = typeof req.body.income !== "number" ? req.body.income : Budget.income;
        Budget.expenses = typeof req.body.expenses !== "number" ? req.body.expenses : Budget.expenses;
        Budget.updated_at = Date.now();

        const savedBudget = await Budget.save();
        return res.json(savedBudget);
    } catch (err) {
        return res.status(500).json({ message: "Error when updating Budget.", error: err });
    }
}

async function remove(req, res) {
    try {
        // Check if the user ID is present
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        const Budget = await BudgetModel.findById(req.params.id);
        if (!Budget) return res.status(404).json({ message: "No such Budget" });
        // Check if the user is authorized to delete this budget
        if (Budget.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this budget" });
        }
        // delete the budget
        await BudgetModel.deleteOne({ _id: req.params.id });
        return res.status(204).json();
    } catch (err) {
        return res.status(500).json({ message: "Error when deleting the Budget.", error: err });
    }
}

module.exports = { list, show, create, update, remove };
