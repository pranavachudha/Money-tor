import { useState, useEffect } from 'react';
import MutualFundForm from './MutualFundForm';

function MutualFundList({ mutualFunds = [], setMutualFunds }) {
    const [liveNavs, setLiveNavs] = useState({});
    const [loadingNavs, setLoadingNavs] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const token = localStorage.getItem('token');

    // Fetch live NAVs for user's mutual funds
    useEffect(() => {
        if (!mutualFunds || mutualFunds.length === 0) return;

        let isMounted = true;
        const fetchNavs = async () => {
            setLoadingNavs(true);
            const navsMap = {};

            await Promise.all(
                mutualFunds.map(async (mf) => {
                    if (!mf.schemeCode) return;
                    try {
                        const response = await fetch(`http://localhost:5000/api/mutualfunds/nav/${encodeURIComponent(mf.schemeCode)}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.nav !== undefined && data.nav !== null) {
                                navsMap[mf.schemeCode] = {
                                    nav: data.nav,
                                    date: data.date,
                                    fundHouse: data.fundHouse
                                };
                            }
                        }
                    } catch (err) {
                        console.log(`Error fetching NAV for scheme ${mf.schemeCode}:`, err);
                    }
                })
            );

            if (isMounted) {
                setLiveNavs(prev => ({ ...prev, ...navsMap }));
                setLoadingNavs(false);
            }
        };

        fetchNavs();

        return () => {
            isMounted = false;
        };
    }, [mutualFunds, token]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove "${name}" from your portfolio?`)) {
            return;
        }

        try {
            setDeletingId(id);
            const response = await fetch(`http://localhost:5000/api/mutualfunds/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMutualFunds(mutualFunds.filter(mf => mf._id !== id));
            } else {
                alert('Failed to delete mutual fund');
            }
        } catch (err) {
            console.log('Error deleting mutual fund:', err);
            alert('Error deleting mutual fund');
        } finally {
            setDeletingId(null);
        }
    };

    // Calculate MF Portfolio Metrics
    const totalUnits = mutualFunds.reduce((sum, mf) => sum + Number(mf.units || 0), 0);
    const totalEstimatedValue = mutualFunds.reduce((sum, mf) => {
        const navInfo = liveNavs[mf.schemeCode];
        const nav = navInfo ? Number(navInfo.nav) : 0;
        return sum + (Number(mf.units || 0) * nav);
    }, 0);

    const totalMonthlyMFSIP = mutualFunds
        .filter(mf => mf.sipEnabled)
        .reduce((sum, mf) => sum + Number(mf.sipAmount || 0), 0);

    return (
        <div>
            {/* Portfolio Summary Card */}
            <div className="card p-3 mb-4 mt-3" style={{ border: '1px solid #2a2d3a', backgroundColor: '#13151f' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" style={{ color: '#e8e0d0', fontWeight: '600' }}>
                        Mutual Funds Portfolio
                    </h4>
                    <button 
                        className={`btn btn-sm ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? '✕ Close Form' : '+ Add Mutual Fund'}
                    </button>
                </div>

                <div className="row g-3">
                    <div className="col-md-4 col-12">
                        <div className="p-3 rounded" style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Portfolio Value</div>
                            <div className="fs-5 fw-bold" style={{ color: '#3d5a80' }}>
                                ₹{totalEstimatedValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Schemes / Units</div>
                            <div className="fs-5 fw-bold" style={{ color: '#e8e0d0' }}>
                                {mutualFunds.length} Funds <span style={{ fontSize: '0.85rem', color: '#7a8fa6' }}>({totalUnits.toFixed(2)} units)</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Monthly SIP Commitment</div>
                            <div className="fs-5 fw-bold" style={{ color: '#c8b99a' }}>
                                ₹{totalMonthlyMFSIP.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsible Add Form */}
            {showAddForm && (
                <div className="mb-4">
                    <MutualFundForm 
                        mutualFunds={mutualFunds} 
                        setMutualFunds={setMutualFunds} 
                        onAddMF={() => setShowAddForm(false)} 
                    />
                </div>
            )}

            {/* Mutual Funds List / Holdings */}
            <div className="card p-3" style={{ border: '1px solid #2a2d3a' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0" style={{ color: '#e8e0d0' }}>
                        Your Mutual Fund Holdings ({mutualFunds.length})
                    </h5>
                    {loadingNavs && (
                        <small className="text-muted">
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Fetching live NAVs from AMFI...
                        </small>
                    )}
                </div>

                {mutualFunds.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <p className="mb-2">You haven't added any mutual funds yet.</p>
                        <button 
                            className="btn btn-primary btn-sm mt-1"
                            onClick={() => setShowAddForm(true)}
                        >
                            + Add Your First Mutual Fund
                        </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #2a2d3a', color: '#7a8fa6', fontSize: '0.85rem' }}>
                                    <th>SCHEME NAME</th>
                                    <th>UNITS OWNED</th>
                                    <th>LATEST NAV</th>
                                    <th>CURRENT VALUE</th>
                                    <th>SIP STATUS</th>
                                    <th className="text-end">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mutualFunds.map((mf) => {
                                    const units = Number(mf.units || 0);
                                    const navData = liveNavs[mf.schemeCode];
                                    const nav = navData ? Number(navData.nav) : null;
                                    const currentValue = nav !== null ? units * nav : null;

                                    return (
                                        <tr key={mf._id} style={{ borderBottom: '1px solid #232736', verticalAlign: 'middle' }}>
                                            <td>
                                                <div className="fw-bold" style={{ color: '#e8e0d0' }}>
                                                    {mf.name}
                                                </div>
                                                {mf.schemeCode && (
                                                    <small style={{ color: '#7a8fa6' }}>
                                                        Code: {mf.schemeCode} {navData?.fundHouse && `• ${navData.fundHouse}`}
                                                    </small>
                                                )}
                                            </td>
                                            <td>{units.toFixed(3)}</td>
                                            <td>
                                                {nav !== null ? (
                                                    <div>
                                                        <span className="fw-bold" style={{ color: '#e8e0d0' }}>
                                                            ₹{nav.toFixed(2)}
                                                        </span>
                                                        {navData?.date && (
                                                            <div style={{ fontSize: '0.75rem', color: '#7a8fa6' }}>
                                                                As of {navData.date}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                        {loadingNavs ? 'Fetching...' : 'N/A'}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {currentValue !== null ? (
                                                    <span className="fw-bold" style={{ color: '#3d5a80' }}>
                                                        ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">--</span>
                                                )}
                                            </td>
                                            <td>
                                                {mf.sipEnabled ? (
                                                    <span className="badge" style={{ backgroundColor: '#2b455a', color: '#c8b99a' }}>
                                                        ₹{mf.sipAmount}/mo (day {mf.sipDate})
                                                    </span>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>None</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(mf._id, mf.name)}
                                                    disabled={deletingId === mf._id}
                                                    title="Remove from portfolio"
                                                >
                                                    {deletingId === mf._id ? '...' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MutualFundList;
