const mongoose = require("mongoose");
const dotenv =require("dotenv");
const connectDB =require("../config/db.js");

const User =require("../models/user.model.js");
const Client =require("../models/client.model.js");
const Invoice =require("../models/invoice.model.js");
const Expense =require("../models/expense.model.js");

dotenv.config();
await connectDB();

const runSeeder = async () => {
  try {
    console.log("🌱 Seeding Advanced Demo Data...");

    await Client.deleteMany({});
    await Invoice.deleteMany({});
    await Expense.deleteMany({});

    const user = await User.findOne();
    if (!user) {
      console.log("❌ No user found. Create user first.");
      process.exit();
    }

    const companyId = user.company;

    /* ================= CLIENTS ================= */
    const clients = await Client.insertMany(
      Array.from({ length: 15 }).map((_, i) => ({
        name: `Client ${i + 1}`,
        email: `client${i + 1}@mail.com`,
        company: companyId,
      }))
    );

    /* ================= INVOICES (12 Months Heavy Data) ================= */
    const invoiceData = [];

    for (let month = 0; month < 12; month++) {
      const invoicesPerMonth = 8 + Math.floor(Math.random() * 5); // 8–12 invoices per month

      for (let i = 0; i < invoicesPerMonth; i++) {
        const randomClient =
          clients[Math.floor(Math.random() * clients.length)];

        const baseAmount = 500 + month * 100; // growth effect
        const randomAmount = baseAmount + Math.floor(Math.random() * 800);

        const statuses = ["paid", "unpaid", "overdue"];
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];

        invoiceData.push({
          client: randomClient._id,
          items: [
            {
              description: "Software Development Service",
              quantity: 1,
              price: randomAmount,
            },
          ],
          totalAmount: randomAmount,
          status: randomStatus,
          dueDate: new Date(2026, month, 15),
          company: companyId,
          createdAt: new Date(2026, month, Math.floor(Math.random() * 28)),
          updatedAt: new Date(),
        });
      }
    }

    await Invoice.insertMany(invoiceData);

    /* ================= EXPENSES ================= */
    const expenseData = [];

    for (let month = 0; month < 12; month++) {
      const expensesPerMonth = 4 + Math.floor(Math.random() * 3);

      for (let i = 0; i < expensesPerMonth; i++) {
        const amount = 200 + Math.floor(Math.random() * 1000);

        expenseData.push({
          title: `Expense ${month + 1}-${i + 1}`,
          amount,
          category: ["Marketing", "Software", "Rent", "Infrastructure"][
            Math.floor(Math.random() * 4)
          ],
          expenseDate: new Date(2026, month, Math.floor(Math.random() * 28)),
          company: companyId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await Expense.insertMany(expenseData);

    console.log("✅ Advanced Demo Data Inserted Successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

runSeeder();