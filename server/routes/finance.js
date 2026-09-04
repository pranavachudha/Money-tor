const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Finance = require('../models/Finance');
const User = require('../models/User');

//GET finance profile
router.get('/', auth, async (req, res) => {
    try {
        const finance = await Finance.findOne({ user: req.user.id });
        res.json(finance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//POST or UPDATE finance profile
router.post('/', auth, async (req, res) => {
    const { name, gmi, budget } = req.body;

    try {
        const user = await User.findById(req.user.id);
        user.name = name;
        await user.save();

        let finance = await Finance.findOne({ user: req.user.id });

        if (finance) {
            // already exists -> update it
            finance.gmi = gmi;
            finance.budget = budget;
            await finance.save();
        } else {
            // doesn't exist -> create it
            finance = new Finance({ user: req.user.id, gmi, budget });
            await finance.save();
        }

        res.json({
            finance,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router;

