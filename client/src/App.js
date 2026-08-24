import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import Login from './components/Login'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'

function Dashboard(){
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/api/expenses", {
                    headers: {'Authorization':`Bearer ${token}`}
                });
                const data = await response.json();
                setExpenses(data);
                setLoading(false);
            } catch (err) {
                console.log("Error in Initial Fetch:", err);
                setLoading(false);
            }
        }

        fetchData();
        
    }, []);


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
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/expenses/${id}`, {
                method: 'DELETE',
                headers: {'Authorization':`Bearer ${token}`}
            });

            setExpenses(expenses.filter((expense) => expense._id !== id));
        } catch (err) {
            console.log("Error on deleting:", err);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }

    return (
        <div className="container mt-4">
            <div className="app-header d-flex justify-content-between align-items-center">
                <h1>Expense Tracker</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="welcome-text">Welcome, {user?.name}!</span>
                    <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                    Logout
                    </button>
                </div>
            </div>
                
            
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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
