import { useEffect, useState } from "react";

function StockForm({ onAddMF }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedMF, setSelectedMF] = useState(null);
    const [units, setUnits] = useState('');
    const [sipEnabled, setSipEnabled] = useState(false);
    const [sipAmount, setSipAmount] = useState("");
    const [sipDate, setSipDate] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!query || selectedMF) return;

        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`https://api.mfapi.in/mf/search?q=${query}`);
                const data = await response.json();
                // filter to only show Indian stocks (.NS and .BO)
                setSuggestions(data);
                setShowDropdown(true);
            } catch (err) {
                console.log('Error fetching suggestions:', err);
            }
        };

        const timer = setTimeout(() => {
            fetchSuggestions();
        }, 500);

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

        const MFData = {
            name: selectedMF?.schemeName || query,
            schemeCode: selectedMF?.schemeCode,
            units,
            sipEnabled,
            sipAmount: sipEnabled ? sipAmount : null,
            sipDate: sipEnabled ? sipDate : null,
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
            onAddMF(data);

            // reset form
            setQuery('');
            setSelectedMF(null);
            setUnits('');
            setSipEnabled(false);
            setSipAmount('');
            setSipDate('');

        } catch (err) {
            console.log('Error adding stock:', err);
        }
    };

    return (
        <div className="card p-3 mt-3">
            <h5 className="mb-3">Add Mutual Fund</h5>
            <form onSubmit={handleSubmit}>

                {/* Stock Search */}
                <div className="mb-3" style={{ position: 'relative' }}>
                    <label className="form-label">Mutual Fund Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. TATAGOLD Mutual Fund, Nippon"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedMF(null);
                        }}
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
                            border: '1px solid #2a2d3a',
                            borderRadius: '8px',
                            maxHeight: '200px',
                            overflowY: 'auto',
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
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#13151f'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{ color: '#e8e0d0', fontWeight: '600' }}>
                                        {MF.schemeName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">units</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 10"
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        required
                    />
                </div>


                <div className="mb-3 d-flex align-items-center gap-3">
                    <label className="form-label mb-0">Enable SIP</label>
                    <div className="form-check form-switch mb-0">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={sipEnabled}
                            onChange={(e) => setSipEnabled(e.target.checked)}
                        />
                    </div>
                </div>

                {sipEnabled && (
                    <>
                        <div className="mb-3">
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

                        <div className="mb-3">
                            <label className="form-label">SIP Day of Month</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="e.g. 15"
                                value={sipDate}
                                min="1"
                                max="31"
                                onChange={(e) => setSipDate(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                <button type="submit" className="btn btn-primary w-100">
                    Add Mutual Fund
                </button>
            </form>
        </div>
    );
}

export default StockForm;