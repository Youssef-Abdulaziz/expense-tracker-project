// Expense Tracker - backend (Express API + PostgreSQL)
//
// PHASE 1
// Setup:
//   1. Create a database named expense_tracker and run schema.sql on it.
//   2. Copy .env.example to a new file named .env and write your PostgreSQL password.
//   3. npm install express cors pg dotenv
// Run:    node server.js   (restart it every time you change this file)
//
// Endpoints you need to build:
//   GET    /api/expenses        return all expenses Done
//   GET    /api/expenses/:id    return one expense (404 if not found)
//   POST   /api/expenses        add an expense (201, or 400 if the data is invalid)
//   PUT    /api/expenses/:id    update an expense (200, 400, or 404)
//   DELETE /api/expenses/:id    delete an expense (200, or 404)
//
// Tips:
//   - Create one Pool (from the "pg" library) with the values from .env,
//     and use pool.query(...) in every route.
//   - ALWAYS send the values as parameters: pool.query("... WHERE id = $1", [id]).
//     NEVER build the SQL text by joining strings with data from the user.
//   - Use RETURNING to get the new (or updated) row back from INSERT and UPDATE.
//   - The database creates the id. The client never sends one.
//   - pg returns NUMERIC as text and DATE as a JavaScript Date, so fix both in your SELECT.
//     Hint: amount::float8 and to_char(date, 'YYYY-MM-DD').
//   - Validate the data before the query, and answer 400 with a message that explains the problem.
//   - Check the id before the query. A text like "abc" makes PostgreSQL throw an error.
//   - Enable CORS so the frontend can talk to the server.
//   - Test every endpoint with Thunder Client BEFORE you connect the frontend.

const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
require ("dotenv").config();
app.use(express.json())

const {Pool} = require("pg");
const pool = new Pool ({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, amount::float, category, to_char(date, 'YYYY-MM-DD') AS date
       FROM expenses
       ORDER BY id`
    );
    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/api/expenses/:id", async (req,res) =>{
    const id = req.params.id;
    try{
        const reponse = await pool.query("SELECT * FROM expenses WHERE id = $1" ,[id]);

        if(reponse.rows.length === 0)
        {
                return res.status(404).json({error :"Not found"});
        }
        res.json(reponse.rows[0]);

    }catch(error){
        console.log(error);
        res.status(500).json({error:"Something went wrong"});
    }
});

// POST ENDPOINT
const ALLOWED_CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];
app.post("/api/expenses", async(req, res) => {
    const {title, amount, category, date} = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
    }

    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a number greater than 0" });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Category must be one of: " + ALLOWED_CATEGORIES.join(", ") });
    }

    if (!date) {
        return res.status(400).json({ message: "Date is required" });
    }

    try{
        const response = await pool.query(
      `INSERT INTO expenses (title, amount, category, date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, amount::float, category, to_char(date, 'YYYY-MM-DD') AS date`,
      [title, amount, category, date]
    );
    res.status(201).json(response.rows[0])
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Something went wrong"});
    }
});

//PUT ENDPOINT
app.put("/api/expenses/:id", async (req, res) => {
  const id = req.params.id;
  const { title, amount, category, date } = req.body;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ message: "Expense not found" });
  }

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a number greater than 0" });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "Category must be one of: " + ALLOWED_CATEGORIES.join(", ") });
  }

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2, category = $3, date = $4
       WHERE id = $5
       RETURNING id, title, amount::float, category, to_char(date, 'YYYY-MM-DD') AS date`,
      [title, amount, category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// DELETE ENDPOINT
app.delete("/api/expenses/:id", async (req, res) => {
  const id = req.params.id;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM expenses WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted", id: result.rows[0].id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});


app.listen(3000, ()=>{
    console.log("Server is Listening on http://localhost:3000")
});