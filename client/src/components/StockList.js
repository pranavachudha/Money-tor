import { useState, useEffect } from 'react';
import StockForm from './StockForm';

function StockList({ stocks = [], setStocks }) {
    const [livePrices, setLivePrices] = useState({});
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const token = localStorage.getItem('token');

    // Fetch live prices for user's stocks
    useEffect(() => {
        if (!stocks || stocks.length === 0) return;

        let isMounted = true;
        const fetchPrices = async () => {
            setLoadingPrices(true);
            const pricesMap = {};

            await Promise.all(
                stocks.map(async (stock) => {
                    try {
                        const symbol = stock.name;
                        const response = await fetch(`http://localhost:5000/api/stocks/price/${encodeURIComponent(symbol)}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.price !== undefined && data.price !== null) {
                                pricesMap[symbol] = data.price;
                            }
                        }
                    } catch (err) {
                        console.log(`Error fetching price for ${stock.name}:`, err);
                    }
                })
            );

            if (isMounted) {
                setLivePrices(prev => ({ ...prev, ...pricesMap }));
                setLoadingPrices(false);
            }
        };

        fetchPrices();

        return () => {
            isMounted = false;
        };
    }, [stocks, token]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from your portfolio?`)) {
            return;
        }

        try {
            setDeletingId(id);
            const response = await fetch(`http://localhost:5000/api/stocks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setStocks(stocks.filter(stock => stock._id !== id));
            } else {
                alert('Failed to delete stock');
            }
        } catch (err) {
            console.log('Error deleting stock:', err);
            alert('Error deleting stock');
        } finally {
            setDeletingId(null);
        }
    };

    // Calculate Portfolio Metrics
    const totalInvested = stocks.reduce((sum, s) => sum + (Number(s.quantity) * Number(s.avgPrice)), 0);
    const totalCurrentValue = stocks.reduce((sum, s) => {
        const currentPrice = livePrices[s.name] ?? Number(s.avgPrice);
        return sum + (Number(s.quantity) * currentPrice);
    }, 0);

    const totalPnL = totalCurrentValue - totalInvested;
    const totalPnLPercentage = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : '0.00';
    const totalMonthlySIP = stocks
        .filter(s => s.sipEnabled)
        .reduce((sum, s) => sum + Number(s.sipAmount || 0), 0);

    return (
        <div>
            {/* Portfolio Summary Card */}
            <div className="card p-3 mb-4 mt-3" style={{ border: '1px solid #2a2d3a', backgroundColor: '#13151f' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" style={{ color: '#e8e0d0', fontWeight: '600' }}>
                        Stocks & ETFs Portfolio
                    </h4>
                    <button 
                        className={`btn btn-sm ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? '✕ Close Form' : '+ Add Stock'}
                    </button>
                </div>

                <div className="row g-3">
                    <div className="col-md-3 col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Invested Value</div>
                            <div className="fs-5 fw-bold" style={{ color: '#e8e0d0' }}>
                                ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Value</div>
                            <div className="fs-5 fw-bold" style={{ color: '#3d5a80' }}>
                                ₹{totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Returns</div>
                            <div className={`fs-5 fw-bold ${totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                                {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({totalPnLPercentage}%)
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Monthly Stock SIP</div>
                            <div className="fs-5 fw-bold" style={{ color: '#c8b99a' }}>
                                ₹{totalMonthlySIP.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsible Add Form */}
            {showAddForm && (
                <div className="mb-4">
                    <StockForm 
                        stocks={stocks} 
                        setStocks={setStocks} 
                        onAddStock={() => setShowAddForm(false)} 
                    />
                </div>
            )}

            {/* Stocks List / Holdings */}
            <div className="card p-3" style={{ border: '1px solid #2a2d3a' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0" style={{ color: '#e8e0d0' }}>
                        Your Holdings ({stocks.length})
                    </h5>
                    {loadingPrices && (
                        <small className="text-muted">
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Updating live prices...
                        </small>
                    )}
                </div>

                {stocks.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <p className="mb-2">You haven't added any stocks or ETFs yet.</p>
                        <button 
                            className="btn btn-primary btn-sm mt-1"
                            onClick={() => setShowAddForm(true)}
                        >
                            + Add Your First Stock
                        </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #2a2d3a', color: '#7a8fa6', fontSize: '0.85rem' }}>
                                    <th>STOCK</th>
                                    <th>QUANTITY</th>
                                    <th>AVG PRICE</th>
                                    <th>INVESTED</th>
                                    <th>LIVE PRICE</th>
                                    <th>CURRENT VAL</th>
                                    <th>P&L</th>
                                    <th>SIP</th>
                                    <th className="text-end">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map((stock) => {
                                    const qty = Number(stock.quantity);
                                    const avg = Number(stock.avgPrice);
                                    const invested = qty * avg;
                                    const live = livePrices[stock.name];
                                    const hasLive = live !== undefined && live !== null;
                                    const currentVal = hasLive ? qty * live : invested;
                                    const pnl = currentVal - invested;
                                    const pnlPercent = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : '0.00';

                                    return (
                                        <tr key={stock._id} style={{ borderBottom: '1px solid #232736', verticalAlign: 'middle' }}>
                                            <td>
                                                <div className="fw-bold" style={{ color: '#e8e0d0' }}>
                                                    {stock.name}
                                                </div>
                                            </td>
                                            <td>{qty}</td>
                                            <td>₹{avg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            <td>₹{invested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            <td>
                                                {hasLive ? (
                                                    <span className="fw-bold" style={{ color: '#e8e0d0' }}>
                                                        ₹{Number(live).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                        ₹{avg} (Avg)
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="fw-bold" style={{ color: '#3d5a80' }}>
                                                    ₹{currentVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td>
                                                {hasLive ? (
                                                    <span className={`badge ${pnl >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(1)} ({pnlPercent}%)
                                                    </span>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>--</span>
                                                )}
                                            </td>
                                            <td>
                                                {stock.sipEnabled ? (
                                                    <span className="badge" style={{ backgroundColor: '#2b455a', color: '#c8b99a' }}>
                                                        ₹{stock.sipAmount}/mo (day {stock.sipDate})
                                                    </span>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>None</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(stock._id, stock.name)}
                                                    disabled={deletingId === stock._id}
                                                    title="Remove from portfolio"
                                                >
                                                    {deletingId === stock._id ? '...' : 'Delete'}
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

export default StockList;
