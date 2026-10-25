import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import Login from './components/Login'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'
import NavBar from './components/NavBar'
import Statistics from './components/Statistics'
import Profile from './components/Profile'

function Dashboard({
    expenses,
    setExpenses,
    editingExpense,
    setEditingExpense,
    addExpense,
    deleteExpense,
    loading,
    setLoading,
    updateExpense
}) {
    const [fetchError, setFetchError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token){
                    return;
                }
                setLoading(true);
                const response = await fetch("http://localhost:5000/api/expenses", {
                    headers: {'Authorization':`Bearer ${token}`}
                });
                const data = await response.json();

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }

                setExpenses(Array.isArray(data) ? data : []);
                setLoading(false);
                setFetchError(false);
            } catch (err) {
                console.log("Error in Initial Fetch:", err);
                setFetchError(true);
                setLoading(false);
                setExpenses([]);
            }
        };

        fetchData();
    }, [navigate, setExpenses, setLoading]);

    return (
        <div className="container mt-4">
            <ExpenseForm 
                onAddExpense={addExpense}
                onUpdateExpense={updateExpense}
                editingExpense={editingExpense}
            />
            { loading ? (
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : fetchError ? (
                <div className="alert alert-danger mt-3">
                    Could not connect to server. Please try again later.
                </div>
            ) : (
                <ExpenseList 
                    expenses={expenses} 
                    onDelete={deleteExpense} 
                    onEdit={setEditingExpense}
                />
            )}
        </div>
    );
}

function App() {
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [stocks, setStocks] = useState([]);
    const [mutualFunds, setMutualFunds] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("http://localhost:5000/api/expenses", {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (Array.isArray(data)) setExpenses(data);
            })
            .catch(err => console.log("Error fetching expenses in App:", err));

            fetch("http://localhost:5000/api/stocks", {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (Array.isArray(data)) setStocks(data);
            })
            .catch(err => console.log("Error fetching stocks in App:", err));

            fetch("http://localhost:5000/api/mutualfunds", {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (Array.isArray(data)) setMutualFunds(data);
            })
            .catch(err => console.log("Error fetching mutual funds in App:", err));
        }
    }, []);

    const addExpense = (newExpense) => {
        setExpenses([...expenses, newExpense]);
    }

    const updateExpense = (updatedExpense) => {
        setExpenses(expenses.map((expense) => {
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

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <NavBar user={user} setUser={setUser} />
                        <Dashboard 
                            expenses={expenses}
                            setExpenses={setExpenses}
                            editingExpense={editingExpense}
                            setEditingExpense={setEditingExpense}
                            addExpense={addExpense}
                            deleteExpense={deleteExpense}
                            loading={loading}
                            setLoading={setLoading}
                            updateExpense={updateExpense}
                        />
                    </PrivateRoute>
                } />
                <Route path="/statistics" element={
                    <PrivateRoute>
                        <NavBar user={user} setUser={setUser} />
                        <Statistics 
                            expenses={expenses}
                            stocks={stocks}
                            mutualFunds={mutualFunds}
                        />
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute>
                        <NavBar user={user} setUser={setUser} />
                        <Profile 
                            user={user}
                            setUser={setUser}
                            stocks={stocks}
                            setStocks={setStocks}
                            mutualFunds={mutualFunds}
                            setMutualFunds={setMutualFunds}
                        />
                    </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;