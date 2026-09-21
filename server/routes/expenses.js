const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// GET all expenses
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new expense
router.post('/', auth, async (req, res) => {
    const expense = new Expense({
        category: req.body.category,
        description: req.body.description,
        amount: req.body.amount,
        date: req.body.date,
        user: req.user.id,
    });

    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update an expense 
router.put('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOne({_id: req.params.id, user: req.user.id })

        if (!expense) {
            return res.status(404).json({message: 'Expense Not found'});
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//DELETE an expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete({ _id: req.params.id, user: req.user.id });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found'});
        }
        
        res.json({ message: 'Expense Deleted'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
