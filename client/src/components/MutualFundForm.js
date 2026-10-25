import { useEffect, useState } from "react";

function MutualFundForm({ mutualFunds, setMutualFunds, onAddMF }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedMF, setSelectedMF] = useState(null);
    const [units, setUnits] = useState('');
    const [sipEnabled, setSipEnabled] = useState(false);
    const [sipAmount, setSipAmount] = useState("");
    const [sipDate, setSipDate] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!query || selectedMF) return;

        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setSuggestions(Array.isArray(data) ? data.slice(0, 15) : []);
                setShowDropdown(true);
            } catch (err) {
                console.log('Error fetching suggestions:', err);
            }
        };

        const timer = setTimeout(() => {
            fetchSuggestions();
        }, 400);

        return () => clearTimeout(timer);
    }, [query, selectedMF]);

    const handleSelect = (MF) => {
        setSelectedMF(MF);
        setQuery(MF.schemeName);
        setSuggestions([]);
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const MFData = {
            name: selectedMF?.schemeName || query,
            schemeCode: selectedMF?.schemeCode,
            units: Number(units),
            sipEnabled,
            sipAmount: sipEnabled ? Number(sipAmount) : null,
            sipDate: sipEnabled ? Number(sipDate) : null,
        };

        try {
            const response = await fetch('http://localhost:5000/api/mutualfunds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(MFData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to add mutual fund');
                setLoading(false);
                return;
            }

            if (setMutualFunds && mutualFunds) {
                setMutualFunds([...mutualFunds, data]);
            }
            if (onAddMF) {
                onAddMF(data);
            }

            // reset form
            setQuery('');
            setSelectedMF(null);
            setUnits('');
            setSipEnabled(false);
            setSipAmount('');
            setSipDate('');
            setLoading(false);

        } catch (err) {
            console.log('Error adding mutual fund:', err);
            setError('Network error adding mutual fund');
            setLoading(false);
        }
    };

    return (
        <div className="card p-4 mt-3" style={{ border: '1px solid #2a2d3a', backgroundColor: '#161922' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0" style={{ color: '#e8e0d0', fontWeight: '600' }}>Add Mutual Fund Scheme</h5>
                <span className="badge" style={{ backgroundColor: '#2b455a', color: '#c8b99a' }}>MF Portfolio</span>
            </div>

            {error && (
                <div className="alert alert-danger py-2" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Search */}
                <div className="mb-3" style={{ position: 'relative' }}>
                    <label className="form-label">Mutual Fund Scheme</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by fund name (e.g. Axis Bluechip, Parag Parikh)"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedMF(null);
                        }}
                        autoComplete="off"
                        required
                    />

                    {/* Dropdown */}
                    {showDropdown && suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            backgroundColor: '#1a1d27',
                            border: '1px solid #3d5a80',
                            borderRadius: '8px',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            marginTop: '4px'
                        }}>
                            {suggestions.map((MF) => (
                                <div
                                    key={MF.schemeCode}
                                    onClick={() => handleSelect(MF)}
                                    style={{
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #2a2d3a',
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#232736'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ color: '#e8e0d0', fontWeight: '600', fontSize: '0.9rem' }}>
                                        {MF.schemeName}
                                    </div>
                                    <small style={{ color: '#7a8fa6' }}>
                                        Scheme Code: {MF.schemeCode}
                                    </small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Units Owned</label>
                    <input
                        type="number"
                        step="any"
                        className="form-control"
                        placeholder="e.g. 145.25"
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#13151f', border: '1px solid #2a2d3a' }}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <label className="form-label mb-0" style={{ cursor: 'pointer' }}>Recurring SIP</label>
                            <div style={{ fontSize: '0.8rem', color: '#7a8fa6' }}>Do you have an active monthly SIP in this fund?</div>
                        </div>
                        <div className="form-check form-switch mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={sipEnabled}
                                onChange={(e) => setSipEnabled(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    {sipEnabled && (
                        <div className="row mt-3 g-2">
                            <div className="col-md-6">
                                <label className="form-label">SIP Amount (₹)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 5000"
                                    value={sipAmount}
                                    onChange={(e) => setSipAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Day of Month</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="1 - 31"
                                    value={sipDate}
                                    min="1"
                                    max="31"
                                    onChange={(e) => setSipDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Adding Mutual Fund...' : 'Add to Mutual Funds'}
                </button>
            </form>
        </div>
    );
}

export default MutualFundForm;