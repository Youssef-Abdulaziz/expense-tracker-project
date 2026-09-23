const express = require("express");
const app = express();

app.get("/api/expenses", (req, res) => {
  const expenses = [
    { id: 1, title: "Groceries", amount: 45.50 },
    { id: 2, title: "Bus ticket", amount: 3.00 }
  ];
  res.json(expenses);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});