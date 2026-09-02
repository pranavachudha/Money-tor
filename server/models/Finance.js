const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    gmi: {
        type: Number,
        required: true,
    },

    budget: {
        type: Number,
        required: true,
    },


});

module.exports = mongoose.model('Finance', FinanceSchema);