const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./backend/.env" });
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");



const app = express();

const PORT = process.env.PORT || 5000;


// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());
app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);
app.get("/api/test", (req, res) => {
    res.json({
        message: "API route is working"
    });
});


// =========================
// MONGODB CONNECTION
// =========================
console.log("Mongo URI loaded:", !!process.env.MONGO_URI);
console.log("Mongo URI length:", process.env.MONGO_URI?.length);
console.log("Mongo URI starts with:", process.env.MONGO_URI?.slice(0, 20));
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });


// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "ExpenseX Backend is running!"
    });
});


// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(`ExpenseX Backend running at http://localhost:${PORT}`);
});