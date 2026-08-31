import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'

function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
        return; 
    }, [navigate])
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();

            console.log("Response Status:", response.status);
            console.log("Response Data", data);

            if (!response.ok) {
                setError(data.message);
                return
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');

        } catch(err) {
            console.log("Full error:", err);
            setError('Something went wrong. Please try again');
        }
    };

    return(
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card p-4">
                        <h3 className="text-center mb-4">Login</h3>

                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className='form-label'>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className='form-label'>Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type='submit' className='btn btn-primary w-100'>
                                Login
                            </button>
                        </form>

                        <p className='text-center mt-3'>
                            Don't have an account? <Link to="/register">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Login;