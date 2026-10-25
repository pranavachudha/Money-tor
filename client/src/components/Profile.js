import StockList from './StockList';
import MutualFundList from './MutualFundList';
import { useEffect, useState } from 'react';

function Profile({ user, setUser, stocks, setStocks, mutualFunds, setMutualFunds }) {
    const [editingForm, setEditingForm] = useState(false);
    const [updatedUserName, setUpdatedUserName] = useState(user?.name);
    const [gmi, setGMI] = useState('0');
    const [budget, setBudget] = useState('0');
    const [section, setSection] = useState('AccountDetails');
    const [investSection, setInvestSection] = useState('Stocks');

    useEffect(() => {
        const setVariables = async () => {
            try {
                const token = localStorage.getItem('token');
                
                const finResponse = await fetch('http://localhost:5000/api/finance', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const finData = await finResponse.json();
                setGMI(finData.gmi);
                setBudget(finData.budget);

                const stockResponse = await fetch('http://localhost:5000/api/stocks', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const stockData = await stockResponse.json();
                setStocks(stockData);

                const mfResponse = await fetch('http://localhost:5000/api/mutualfunds', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const mfData = await mfResponse.json();
                setMutualFunds(mfData);

            } catch (err) {
                console.log('Error while fetching profile data:', err);
            }
        }
        setVariables();
    }, [setMutualFunds, setStocks]);

    const handleEdit = (e) => {
        e.preventDefault();
        setEditingForm(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const financeData = { name: updatedUserName, gmi, budget };
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/finance', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(financeData)
            });
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        } catch (err) {
            console.log('Error editing account details:', err);
        }
        setEditingForm(false);
    };

    return (
        <div className='container'>
            <div className='row g-2'>
                <div className='col-3'>
                    <div className='card mt-3' style={{ backgroundColor: '#13151f' }}>
                        {[
                            { label: 'Account Details', value: 'AccountDetails' },
                            { label: 'Investments', value: 'Investments' },
                            { label: 'Debts', value: 'Debts' },
                        ].map((item) => (
                            <div
                                key={item.value}
                                onClick={() => setSection(item.value)}
                                style={{
                                    padding: '14px 20px',
                                    cursor: 'pointer',
                                    borderLeft: section === item.value ? '3px solid #3d5a80' : '3px solid transparent',
                                    backgroundColor: section === item.value ? '#13151f' : 'transparent',
                                    color: section === item.value ? '#e8e0d0' : '#7a8fa6',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease',
                                    userSelect: 'none',
                                }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>

                {section === 'AccountDetails' && (
                    !editingForm ? (
                        <div className="col-9">
                            <div className='card p-3 mt-3'>
                                <h2 className="ms-2 mb-3">Account Details</h2>
                                <div className="card p-3">
                                    <div className='d-flex justify-content-between'>
                                        <h4 className='d-inline'>User Details</h4>
                                        <button className='btn btn-outline-danger btn-sm d-inline pe-3 ps-3' onClick={handleEdit}>
                                            Edit
                                        </button>
                                    </div>
                                    <p className="mt-1 mb-2 text-muted">User Name: {user?.name}</p>
                                    <p className="text-muted mb-2">Mail Id: {user?.email}</p>
                                    <p className="text-muted mb-2">Gross Monthly Income: ₹{gmi}</p>
                                    <p className="text-muted mb-1">Budget: ₹{budget}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="col-9">
                            <div className='card p-3 mt-3'>
                                <h2 className="ms-2 mb-3">Editing Account Details</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">User Name</label>
                                        <input type="text" className="form-control" value={updatedUserName} onChange={(e) => setUpdatedUserName(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Gross Monthly Income</label>
                                        <input type="number" className="form-control" value={gmi} onChange={(e) => setGMI(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Budget</label>
                                        <input type="number" className="form-control" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Submit</button>
                                </form>
                            </div>
                        </div>
                    )
                )}

                {section === 'Investments' && (
                    <div className="col-9">
                        <div className='card p-3 mt-3' style={{ backgroundColor: '#13151f', border: '1px solid #2a2d3a' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="ms-2 mb-0" style={{ fontSize: '1.4rem', fontWeight: '600' }}>Investments Portfolio</h3>
                                <div className="d-flex gap-2">
                                    <button
                                        className={`btn btn-sm ${investSection === 'Stocks' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setInvestSection('Stocks')}
                                    >
                                        Stocks & ETFs ({stocks?.length || 0})
                                    </button>
                                    <button
                                        className={`btn btn-sm ${investSection === 'MFs' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setInvestSection('MFs')}
                                    >
                                        Mutual Funds ({mutualFunds?.length || 0})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {investSection === 'Stocks' && (
                            <StockList
                                stocks={stocks}
                                setStocks={setStocks}
                            />
                        )}

                        {investSection === 'MFs' && (
                            <MutualFundList
                                mutualFunds={mutualFunds}
                                setMutualFunds={setMutualFunds}
                            />
                        )}
                    </div>
                )}

                {section === 'Debts' && (
                    <div className="col-9">
                        <div className='card p-3 mt-3'>
                            <h2 className="ms-2 mb-3">Debts</h2>
                            <p className="text-muted">Coming soon...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;