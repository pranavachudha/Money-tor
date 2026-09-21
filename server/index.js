const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const expenseRoutes = require('./routes/expenses');
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const stockRoutes = require('./routes/stocks');
const mutualfundRoutes = require('./routes/mutualfunds');
dotenv.config();

const app = express();

app.use(express.json())
app.use(cors());
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/mutualfunds', mutualfundRoutes);

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch((err) => console.log('Connection failed:', err));

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is alive!' });
});

const PORT = process.env.port || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})