import { useEffect, useState } from "react";

function StockForm({ stocks, setStocks, onAddStock }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [avgPrice, setAvgPrice] = useState("");
    const [sipEnabled, setSipEnabled] = useState(false);
    const [sipAmount, setSipAmount] = useState("");
    const [sipDate, setSipDate] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!query || selectedStock) return;

        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/stocks/search?q=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    // prioritize Indian stocks (.NS and .BO), but keep global if searched specifically
                    const indian = data.filter(s => 
                        s.symbol?.endsWith('.NS') || s.symbol?.endsWith('.BO')
                    );
                    setSuggestions(indian.length > 0 ? indian : data.slice(0, 8));
                    setShowDropdown(true);
                }
            } catch (err) {
                console.log('Error fetching suggestions:', err);
            }
        };

        const timer = setTimeout(() => {
            fetchSuggestions();
        }, 400);

        return () => clearTimeout(timer);
    }, [query, token, selectedStock]);

    const handleSelect = (stock) => {
        setSelectedStock(stock);
        setQuery(stock.symbol);
        setSuggestions([]);
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const stockData = {
            name: selectedStock?.symbol || query.toUpperCase().trim(),
            quantity: Number(quantity),
            avgPrice: Number(avgPrice),
            sipEnabled,
            sipAmount: sipEnabled ? Number(sipAmount) : null,
            sipDate: sipEnabled ? Number(sipDate) : null,
        };

        try {
            const response = await fetch('http://localhost:5000/api/stocks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(stockData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to add stock');
                setLoading(false);
                return;
            }

            if (setStocks && stocks) {
                setStocks([...stocks, data]);
            }
            if (onAddStock) {
                onAddStock(data);
            }

            // reset form
            setQuery('');
            setSelectedStock(null);
            setQuantity('');
            setAvgPrice('');
            setSipEnabled(false);
            setSipAmount('');
            setSipDate('');
            setLoading(false);
        } catch (err) {
            console.log('Error adding stock:', err);
            setError('Network error adding stock');
            setLoading(false);
        }
    };

    return (
        <div className="card p-4 mt-3" style={{ border: '1px solid #2a2d3a', backgroundColor: '#161922' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0" style={{ color: '#e8e0d0', fontWeight: '600' }}>Add Stock / ETF</h5>
                <span className="badge" style={{ backgroundColor: '#2b455a', color: '#c8b99a' }}>Equity</span>
            </div>

            {error && (
                <div className="alert alert-danger py-2" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Stock Search */}
                <div className="mb-3" style={{ position: 'relative' }}>
                    <label className="form-label">Stock Symbol / Company Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. RELIANCE, TATAMOTORS, INFY"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedStock(null);
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
                            {suggestions.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    onClick={() => handleSelect(stock)}
                                    style={{
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #2a2d3a',
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#232736'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{ color: '#e8e0d0', fontWeight: '600' }}>
                                        {stock.symbol}
                                    </span>
                                    <span style={{ color: '#7a8fa6', fontSize: '0.85rem', marginLeft: '10px' }}>
                                        {stock.shortname || stock.longname}
                                    </span>
                                    {stock.exchDisp && (
                                        <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>
                                            {stock.exchDisp}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Quantity</label>
                        <input
                            type="number"
                            step="any"
                            className="form-control"
                            placeholder="e.g. 10"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Avg Buy Price (₹)</label>
                        <input
                            type="number"
                            step="any"
                            className="form-control"
                            placeholder="e.g. 2500"
                            value={avgPrice}
                            onChange={(e) => setAvgPrice(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#13151f', border: '1px solid #2a2d3a' }}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <label className="form-label mb-0" style={{ cursor: 'pointer' }}>Recurring Stock SIP</label>
                            <div style={{ fontSize: '0.8rem', color: '#7a8fa6' }}>Do you buy this stock periodically?</div>
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
                    {loading ? 'Adding Stock...' : 'Add to Stock Portfolio'}
                </button>
            </form>
        </div>
    );
}

export default StockForm;