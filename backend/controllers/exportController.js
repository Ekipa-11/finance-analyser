const User = require("../models/UserModel");
const Transaction = require("../models/TransactionModel");
const Budget = require("../models/BudgetModel");
const { generateFinancialReport } = require("../utils/pdfReportGen");
const { transactionsToCsv } = require("../utils/transactions2Csv");

async function getUserReport(req, res) {
    try {
        // Check if the user is authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        const userId = req.user.id;

        // Fetch User
        const user = await User.findById(userId).lean(); // .lean() = plain JS object
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch Transactions
        const transactions = await Transaction.find({ user_id: userId }).sort({ date: -1 }).lean();
        if (!transactions || transactions.length === 0) return res.status(404).json({ message: "No transactions found for this user" });

        // Fetch Budgets
        const budgets = await Budget.find({ user_id: userId }).sort({ year: -1, month: -1 }).lean();
        if (!budgets || budgets.length === 0) return res.status(404).json({ message: "No budgets found for this user" });

        // Generate PDF report
        const pdfBuffer = await generateFinancialReport(user, transactions, budgets);

        const fileName = `financial_report_${user.username}_${new Date().toISOString().slice(0, 10)}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF report:", error);
        res.status(500).json({ message: "Failed to generate PDF report", error: error.message });
    }
}

// getTransactionsCsv
async function getTransactionsCsv(req, res) {
    try {
        // Check if the user is authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        const userId = req.user.id;

        // Fetch Transactions
        const transactions = await Transaction.find({ user_id: userId }).sort({ date: -1 }).lean();
        if (!transactions || transactions.length === 0) return res.status(404).json({ message: "No transactions found for this user" });

        // Convert transactions to CSV
        const csvData = transactionsToCsv(transactions);

        const fileName = `transactions_${userId}_${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.send(csvData);
    } catch (error) {
        console.error("Error generating CSV:", error);
        res.status(500).json({ message: "Failed to generate CSV", error: error.message });
    }
}

module.exports = {
    getUserReport,
    getTransactionsCsv,
};
