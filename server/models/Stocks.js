const mongoose = require('mongoose');

const StocksSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
    },

    avgPrice: {
        type: Number,
        required: true,
    },

    sipEnabled: {
        type: Boolean,
        default: false,
    },

    sipAmount: {
        type: Number,
        required: false,
    },

    sipDate: {
        type: Number,
        required: false,
    },

});

module.exports = mongoose.model('Stocks', StocksSchema);