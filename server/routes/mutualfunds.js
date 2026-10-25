const express = require('express');
const router = express.Router();
const MutualFund = require('../models/MutualFunds');
const auth = require('../middleware/auth');

//GET Mutual Fund
router.get("/", auth, async (req, res) => {
    try {
        const mutualFunds = await MutualFund.find({user: req.user.id});
        res.json(mutualFunds);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// GET live NAV for a mutual fund
router.get('/nav/:schemeCode', auth, async (req, res) => {
    try {
        const response = await fetch(`https://api.mfapi.in/mf/${encodeURIComponent(req.params.schemeCode)}`);
        const data = await response.json();
        const latestEntry = data.data?.[0];
        const nav = latestEntry ? parseFloat(latestEntry.nav) : null;
        const date = latestEntry ? latestEntry.date : null;
        const fundHouse = data.meta?.fund_house;
        const schemeName = data.meta?.scheme_name;
        res.json({ schemeCode: req.params.schemeCode, nav, date, fundHouse, schemeName });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//POST Mutual Fund
router.post("/", auth, async (req, res) => {
    try {
        const existing = await MutualFund.findOne({ 
            user: req.user.id, 
            name: req.body.name 
        });

        if (existing) {
            return res.status(400).json({ message: 'Mutual Fund already exists in your portfolio' });
        }

        const MF = new MutualFund({
            user: req.user.id,
            name: req.body.name,
            schemeCode: req.body.schemeCode,
            units: req.body.units,
            sipAmount: req.body.sipAmount,
            sipEnabled: req.body.sipEnabled,
            sipDate: req.body.sipDate,
        });

        const response = await MF.save();
        res.status(201).json(response);

    } catch(err) {
        res.status(400).json({ message: err.message });
    }
});

//PUT Mutual Fund
router.put('/:id', auth, async (req, res) => {
    try {
        const MF = await MutualFund.findOne({ _id: req.params.id, user: req.user.id });

        if (!MF) {
            return res.status(404).json({ message: 'Mutual Fund is not Found.' });
        }

        const updatedMF = await MutualFund.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true},
        );

        res.json(updatedMF);
    } catch (err){
        res.status(400).json({message: err.message});
    }
});

//DELETE Mutual Fund

router.delete("/:id", auth, async (req, res) => {
    try {
        const MF = await MutualFund.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!MF) {
            return res.status(404).json({message: "Mutual Fund not found."});
        }

        await MutualFund.findByIdAndDelete({ _id: req.params.id });
        res.json({message: "Mutual Fund Deleted."});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;