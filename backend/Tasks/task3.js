require("dotenv").config();
const express = require("express");
const app = express();
const {Pool} = require("pg");

const pool = new Pool ({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

app.get("/api/expenses/:id", async (req , res) => {
    const id = req.params.id;

    try{
        const result = await pool.query("SELECT * FROM expenses WHERE  id = $1", [id]);

        if(result.rows.length === 0){
            return res.status(404).json({error:"bla bla bla"})
        }
        res.json(result.rows[0]);
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Something went wrong"});
    }
});
app.listen(3001, () => {
  console.log("Task 3 server running on http://localhost:3001");
});