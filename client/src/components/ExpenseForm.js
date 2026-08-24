import { useState, useEffect } from 'react'

function ExpenseForm({ onAddExpense, onUpdateExpense, editingExpense }) {
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (editingExpense) {
            setCategory(editingExpense.category);
            setDescription(editingExpense.description);
            setAmount(editingExpense.amount);
            setDate(editingExpense.date.slice(0, 10));
        }

        else {
            setCategory('');
            setDescription('');
            setAmount('');
            setDate('');
        }
    }, [editingExpense]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const expenseData = { 
            category: category, 
            description: description, 
            amount: amount, 
            date: date
        };

        try {
            const token = localStorage.getItem('token')
            if (editingExpense) {
                const response = await fetch(`http://localhost:5000/api/expenses/${editingExpense._id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(expenseData)
                })

                const updatedData = await response.json();
                onUpdateExpense(updatedData);
            } else {
                const response = await fetch('http://localhost:5000/api/expenses', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(expenseData),
                });

                const data = await response.json();
                onAddExpense(data);

            }

            setCategory('');
            setDescription('');
            setAmount('');
            setDate('');

        } catch (err) {
            console.error('Error adding expense:', err);
        }
    };
    return (
        <div className="card p-4 mb-4">
            <h4 className="mb-3">{editingExpense? 'Edit Expense' : 'Add New Expense'}</h4>
            <form onSubmit={handleSubmit} >
                <div className = "mb-3">
                    <label className="form-label">Category</label>
                    <input
                        type = "text"
                        className = "form-control"
                        value = {category}
                        onChange = {(e) => setCategory(e.target.value)}
                        placeholder = "e.g, Food, Transport"
                        required
                    />
                </div>

                <div className = "mb-3">
                    <label className="form-label">Description</label>
                    <input
                        type = "text"
                        className = "form-control"
                        value = {description}
                        onChange = {(e) => setDescription(e.target.value)}
                        placeholder = "Optional Details"
                    />
                </div>

                <div className = "mb-3">
                    <label className="form-label">Amount (INR)</label>
                    <input
                        type = "number"
                        className = "form-control"
                        value = {amount}
                        onChange = {(e) => setAmount(e.target.value)}
                        placeholder = "e.g, 250, 500"
                        required
                    />
                </div>

                <div className = "mb-3">
                    <label className="form-label">Date</label>
                    <input
                        type = "date"
                        className = "form-control"
                        value = {date}
                        onChange = {(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    {editingExpense? 'Add Edited Expense' : 'Add Expense'}
                </button>
                
            </form>
        </div>
    )
}
export default ExpenseForm;