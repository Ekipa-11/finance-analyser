const PDFDocument = require("pdfkit");

function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
        return "Invalid Date";
    }
}

function formatCurrency(amount) {
    if (typeof amount !== "number" || isNaN(amount)) return "N/A";
    return amount.toFixed(2) + "€";
}

function generateFinancialReport(user, transactions, budgets) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, bufferPages: true });
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on("error", reject);

        // --- Report Header ---
        doc.fontSize(20).text("Financial Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`User: ${user.username || "N/A"}`);
        doc.text(`Email: ${user.email || "N/A"}`);
        doc.text(`Report Date: ${formatDate(new Date())}`);
        doc.moveDown(2);

        // --- Overall Financial Summary ---
        doc.fontSize(16).text("Overall Financial Summary", { underline: true });
        doc.moveDown(0.5);

        let totalIncome = 0;
        let totalExpenses = 0;
        transactions.forEach((t) => {
            if (t.type === "income") totalIncome += t.amount;
            if (t.type === "expense") totalExpenses += t.amount;
        });
        const netBalance = totalIncome - totalExpenses;

        doc.fontSize(12).text(`Total Income: ${formatCurrency(totalIncome)}`);
        doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`);
        doc.font("Helvetica-Bold").fillColor(netBalance >= 0 ? "green" : "red");
        doc.text(`Net Balance: ${formatCurrency(netBalance)}`);
        doc.fillColor("black").font("Helvetica"); // Reset font
        doc.moveDown(2);

        // --- Transactions Section ---
        doc.addPage().fontSize(18).text("Transaction History", { underline: true });
        doc.moveDown(0.5);

        if (transactions.length > 0) {
            const tableTop = doc.y;
            const dateX = 50;
            const typeX = 120;
            const categoryX = 180;
            const descriptionX = 280;
            const amountX = 480; // Adjusted for right alignment

            function drawTransactionHeader() {
                // Draw table header background
                const headerY = doc.y;
                const headerHeight = 18;
                doc.rect(45, headerY - 2, 520, headerHeight)
                    .fill("#e0e0e0")
                    .fillColor("black");

                // Draw table header text
                doc.font("Helvetica-Bold").fontSize(10).fillColor("black");
                doc.text("Date", dateX, headerY, { width: 60 });
                doc.text("Type", typeX, headerY, { width: 50 });
                doc.text("Category", categoryX, headerY, { width: 90 });
                doc.text("Description", descriptionX, headerY, { width: 190 });
                doc.text("Amount", amountX, headerY, { width: 60, align: "right" });

                // Reset font and move to next row
                doc.font("Helvetica").fontSize(9);
                doc.y = headerY + headerHeight;
            }

            drawTransactionHeader();

            transactions.forEach((t) => {
                const currentY = doc.y;
                if (currentY > 720) {
                    // Check for page break (approximate)
                    doc.addPage();
                    drawTransactionHeader();
                }

                // Calculate row height based on description length (twice the height if long)
                const description = t.description || "N/A";
                const descWidth = 220;
                const descFontSize = 9;
                doc.fontSize(descFontSize);
                const descLines = doc.heightOfString(description, { width: descWidth });
                const baseRowHeight = 18;
                // If description needs more than one line, double the row height
                const rowHeight = descLines + baseRowHeight * 0.2

                // Draw table row background for better readability (alternating colors)
                const isEven = transactions.indexOf(t) % 2 === 0;
                doc.rect(45, currentY - 2, 520, rowHeight)
                    .fill(isEven ? "#f5f5f5" : "#ffffff")
                    .fillColor("black");

                // Draw table cells
                doc.fontSize(9).fillColor("black");
                doc.text(formatDate(t.date), dateX, currentY, { width: 60, height: rowHeight });
                doc.text(t.type, typeX, currentY, { width: 50, height: rowHeight });
                doc.text(t.category || "N/A", categoryX, currentY, { width: 90, height: rowHeight });
                doc.text(description, descriptionX, currentY, { width: descWidth, height: rowHeight });
                doc.text(formatCurrency(t.amount), amountX, currentY, { width: 60, align: "right", height: rowHeight });

                // Move to next row
                doc.y = currentY + rowHeight;
            });
        } else {
            doc.fontSize(12).text("No transactions found for this user.");
        }
        doc.moveDown(2);

        // --- Budgets Section ---
        doc.addPage().fontSize(18).text("Budget Overview", { underline: true });
        doc.moveDown(0.5);

        if (budgets.length > 0) {
            budgets.forEach((budget) => {
                // check if new page is needed
                if (doc.y > 650) doc.addPage();

                doc.fontSize(14).text(`Budget for: ${String(budget.month).padStart(2, "0")}/${budget.year}`);
                doc.moveDown(0.5);

                doc.fontSize(10);
                doc.text(`Planned Income: ${formatCurrency(budget.income)}`);
                doc.text(`Planned Expenses: ${formatCurrency(budget.expenses)}`);

                let actualBudgetIncome = 0;
                let actualBudgetExpenses = 0;
                transactions.forEach((t) => {
                    const transactionDate = new Date(t.date);
                    if (transactionDate.getFullYear() === budget.year && transactionDate.getMonth() + 1 === budget.month) {
                        if (t.type === "income") actualBudgetIncome += t.amount;
                        if (t.type === "expense") actualBudgetExpenses += t.amount;
                    }
                });

                doc.text(`Actual Income: ${formatCurrency(actualBudgetIncome)}`);
                doc.text(`Actual Expenses: ${formatCurrency(actualBudgetExpenses)}`);

                const incomeVariance = actualBudgetIncome - budget.income;
                const expenseVariance = budget.expenses - actualBudgetExpenses;

                doc.font("Helvetica-Bold");
                doc.fillColor(incomeVariance >= 0 ? "green" : "red");
                doc.text(`Income Variance: ${formatCurrency(incomeVariance)}`);
                doc.fillColor(expenseVariance >= 0 ? "green" : "red");
                doc.text(`Expense Performance: ${formatCurrency(expenseVariance)}`);
                doc.fillColor("black").font("Helvetica"); // Reset
                // doc.moveDown(0.5);

                // Expenses Performance added with IncomeVariance
                doc.fillColor("black").font("Helvetica"); // Reset font color
                doc.text("Budget Status: ", { continued: true })
                    .font("Helvetica-Bold")
                    .text(incomeVariance >= 0 && expenseVariance >= 0 ? "On Track" : "Needs Attention")
                    .font("Helvetica");

                doc.moveDown(1.5);
            });
        } else {
            doc.fontSize(12).tetext("No budgets found for this user.");
        }

        doc.end();
    });
}

module.exports = {
    generateFinancialReport,
};
