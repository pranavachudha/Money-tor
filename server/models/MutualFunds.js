const mongoose = require('mongoose');

const MutualFundsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    units: {
        type: Number,
        required: true,
    },

    sipAmount: {
        type: Number,
        required: false,
    },

    sipEnabled: {
        type: Boolean,
        default: false,
    },

    sipDate: {
        type: Number,
        required: false,
    },
    schemeCode: {
        type: Number,
        required: false,
    }
});

module.exports = mongoose.model('MutualFunds', MutualFundsSchema);