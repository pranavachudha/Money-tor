import { useEffect, useState } from "react";

function StockForm({ onAddStock }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [avgPrice, setAvgPrice] = useState("");
    const [sipEnabled, setSipEnabled] = useState(false);
    const [sipAmount, setSipAmount] = useState("");
    const [sipDate, setSipDate] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!query || selectedStock) return;

        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/stocks/search?q=${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                // filter to only show Indian stocks (.NS and .BO)
                const indian = data.filter(s => 
                    s.symbol?.endsWith('.NS') || s.symbol?.endsWith('.BO')
                );
                setSuggestions(indian);
                setShowDropdown(true);
            } catch (err) {
                console.log('Error fetching suggestions:', err);
            }
        };

        const timer = setTimeout(() => {
            fetchSuggestions();
        }, 500);

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

        const stockData = {
            name: selectedStock?.symbol || query,
            quantity,
            avgPrice,
            sipEnabled,
            sipAmount: sipEnabled ? sipAmount : null,
            sipDate: sipEnabled ? sipDate : null,
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
            onAddStock(data);

            // reset form
            setQuery('');
            setSelectedStock(null);
            setQuantity('');
            setAvgPrice('');
            setSipEnabled(false);
            setSipAmount('');
            setSipDate('');

        } catch (err) {
            console.log('Error adding stock:', err);
        }
    };

    return (
        <div className="card p-3 mt-3">
            <h5 className="mb-3">Add Stock / ETF</h5>
            <form onSubmit={handleSubmit}>

                {/* Stock Search */}
                <div className="mb-3" style={{ position: 'relative' }}>
                    <label className="form-label">Stock / ETF Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. TATAGOLD, RELIANCE"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedStock(null);
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
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#13151f'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{ color: '#e8e0d0', fontWeight: '600' }}>
                                        {stock.symbol}
                                    </span>
                                    <span style={{ color: '#7a8fa6', fontSize: '0.85rem', marginLeft: '10px' }}>
                                        {stock.shortname || stock.longname}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 10"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Avg Buy Price (₹)</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 2500"
                        value={avgPrice}
                        onChange={(e) => setAvgPrice(e.target.value)}
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
                    Add Stock
                </button>
            </form>
        </div>
    );
}

export default StockForm;