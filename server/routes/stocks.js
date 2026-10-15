const express = require('express');
const router = express.Router();
const Stock = require('../models/Stocks');
const auth = require('../middleware/auth');


//GET all stocks
router.get('/', auth, async (req, res) => {
    try {
        const stocks = await Stock.find({ user: req.user.id });
        res.json(stocks)
    } catch (err) {
        res.status(500).json({message: err.message});
    }
})

//GET suggestions for the query from Yahoo! finance
router.get('/search', auth, async (req, res) => {
    try {
        const query = req.query.q;
        const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${query}&lang=en-US`);
        const data = await response.json();
        res.json(data.quotes);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
})

//POST a new stock
router.post('/', auth, async (req, res) => {
    const stock = new Stock({
        user: req.user.id,
        name: req.body.name,
        quantity: req.body.quantity,
        avgPrice: req.body.avgPrice,
        sipEnabled: req.body.sipEnabled,
        sipAmount: req.body.sipAmount,
        sipDate: req.body.sipDate,
    });

    try {
        const newStock = await stock.save();
        res.status(201).json(newStock);
    } catch (err) {
        res.status(400).json({ messsage: err.message });
    }
})

//PUT update stocks values
router.put("/:id", auth, async (req, res) => {
    try {
        const stock = await Stock.findOne({ _id: req.params.id, user: req.user.id })
        
        if (!stock) {
            return res.status(404).json({message: "Stock Not found."});
        }

        const updatedStock = await Stock.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true}
        );

        res.json(updatedStock);
    } catch(err) {
        res.status(400).json({ message: err.message });
    }

});

//DELETE a Stock
router.delete("/:id", auth, async (req, res) => {
    try {
        const stock = await Stock.findOne({ user: req.user.id, _id: req.params.id});
        
        if (!stock) {
            return res.status(404).json({message: 'Stock not found.'});
        }

        await Stock.findByIdAndDelete({ user: req.user.id});
        res.json({ message: 'Stock Deleted.'});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
})

module.exports = router;