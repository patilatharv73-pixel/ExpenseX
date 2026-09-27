const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const protect = require("../middleware/authMiddleware");


// =========================
// GET USER TRANSACTIONS
// =========================

router.get("/", protect, async (req, res) => {

    try {

        const transactions = await Transaction.find({
            userId: req.user.userId
        }).sort({
            createdAt: -1
        });

        res.json(transactions);

    } catch (error) {

        console.error("Fetch transactions error:", error);

        res.status(500).json({
            message: "Failed to fetch transactions",
            error: error.message
        });
    }
});


// =========================
// CREATE TRANSACTION
// =========================

router.post("/", protect, async (req, res) => {

    try {

        const {
            title,
            amount,
            category,
            date,
            type,
            currency
        } = req.body;


        const transaction = new Transaction({

            userId: req.user.userId,

            title,
            amount,
            category,
            date,
            type,
            currency

        });


        const savedTransaction =
            await transaction.save();


        res.status(201).json(savedTransaction);

    } catch (error) {

        console.error("Create transaction error:", error);

        res.status(400).json({
            message: "Failed to create transaction",
            error: error.message
        });
    }
});

// =========================
// UPDATE USER TRANSACTION
// =========================

router.put("/:id", protect, async (req, res) => {

    try {

        const {
            title,
            amount,
            category,
            date,
            type,
            currency
        } = req.body;


        const updatedTransaction =
            await Transaction.findOneAndUpdate(

                {
                    _id: req.params.id,
                    userId: req.user.userId
                },

                {
                    title,
                    amount,
                    category,
                    date,
                    type,
                    currency
                },

                {
                    new: true,
                    runValidators: true
                }
            );


        if (!updatedTransaction) {

            return res.status(404).json({
                message: "Transaction not found"
            });

        }


        res.json(updatedTransaction);

    } catch (error) {

        console.error(
            "Update transaction error:",
            error
        );

        res.status(400).json({
            message: "Failed to update transaction",
            error: error.message
        });
    }
});
// =========================
// DELETE USER TRANSACTION
// =========================

router.delete("/:id", protect, async (req, res) => {

    try {

        const deletedTransaction =
            await Transaction.findOneAndDelete({
                _id: req.params.id,
                userId: req.user.userId
            });


        if (!deletedTransaction) {

            return res.status(404).json({
                message: "Transaction not found"
            });
        }


        res.json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {

        console.error("Delete transaction error:", error);

        res.status(500).json({
            message: "Failed to delete transaction",
            error: error.message
        });
    }
});


module.exports = router;