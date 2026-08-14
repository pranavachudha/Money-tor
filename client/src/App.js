import { useState, useEffect } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'

function App(){
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/expenses");
                const data = await response.json();
                setExpenses(data);
                setLoading(false);
            } catch (err) {
                console.log("Error in Initial Fetch:", err);
                setLoading(false);
            }
        }

        fetchData();
        
    }, [])


    const addExpense = (newExpense) => {
        setExpenses([...expenses, newExpense]);
    }

    const updateExpense = (updatedExpense) => {
        setExpenses(expenses.map((expense) =>{
            return expense._id === updatedExpense._id ? updatedExpense : expense;
        }));
        setEditingExpense(null);
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
            <ExpenseForm 
                onAddExpense={addExpense}
                onUpdateExpense={updateExpense}
                editingExpense={editingExpense}
            />
            { loading ? 
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            :
            <ExpenseList 
                expenses={expenses} 
                onDelete={deleteExpense} 
                onEdit={setEditingExpense}
            />
            }
        </div>
    )
}

export default App;
