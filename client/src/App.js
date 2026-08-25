import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import Login from './components/Login'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'
import NavBar from './components/NavBar'
import Statistics from './components/Statistics'

function Dashboard(props){
    return (
        <div className="container mt-4">

            <ExpenseForm 
                onAddExpense={props.addExpense}
                onUpdateExpense={props.updateExpense}
                editingExpense={props.editingExpense}
            />
            
            { props.loading ? 
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            :
            <ExpenseList 
                expenses={props.expenses} 
                onDelete={props.deleteExpense} 
                onEdit={props.setEditingExpense}
            />
            }
        </div>
    )
}

function App() {
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token)
                    return;
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

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <NavBar />
                        <Dashboard 
                            expenses={expenses} 
                            editingExpense={editingExpense}
                            setEditingExpense={setEditingExpense}
                            addExpense={addExpense}
                            deleteExpense={deleteExpense}
                            loading={loading}
                            updateExpense={updateExpense}
                        />
                    </PrivateRoute>
                } />
                <Route path="/statistics" element={
                    <PrivateRoute>
                        <NavBar />
                        <Statistics expenses={expenses}/>
                    </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
