import { useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'

function App(){
    const [expenses, setExpenses] = useState([]);

    const addExpense = (newExpense) => {
        setExpenses([...expenses, newExpense]);
    }

    const deleteExpense = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/expenses/${id}`, {
                method: 'DELETE',
            });

            setExpenses(expenses.filter((expense) => expense._id !== id));
        } catch (err) {
            console.log("Error on deleting:", err);
        }
    }

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Expense Tracker</h1>
            <ExpenseForm onAddExpense={addExpense}/>
            <ExpenseList expenses={expenses} onDelete={deleteExpense} />
        </div>
    )
}

export default App;
