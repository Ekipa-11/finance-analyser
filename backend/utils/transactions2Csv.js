// Transactions to CSV conversion utility
const { Parser } = require("json2csv");

function transactionsToCsv(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        throw new Error("No transactions to convert to CSV");
    }

    // Define the fields to include in the CSV
    const fields = ["date", "type", "amount", "category", "description", "user_id"];

    // Create a new parser instance
    const json2csvParser = new Parser({ fields });

    // Convert the transactions array to CSV format
    return json2csvParser.parse(transactions);
}

module.exports = { transactionsToCsv };
