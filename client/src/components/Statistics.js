import { useState, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { Link } from 'react-router-dom';

function Statistics({ expenses = [], stocks = [], mutualFunds = [] }) {
    const [livePrices, setLivePrices] = useState({});
    const [liveNavs, setLiveNavs] = useState({});
    const [loadingLive, setLoadingLive] = useState(false);
    const token = localStorage.getItem('token');

    // Fetch live market data for stocks and mutual funds
    useEffect(() => {
        let isMounted = true;
        const fetchAllLive = async () => {
            if (!token) return;
            setLoadingLive(true);
            const pricesMap = {};
            const navsMap = {};

            const stockPromises = stocks.map(async (stock) => {
                try {
                    const res = await fetch(`http://localhost:5000/api/stocks/price/${encodeURIComponent(stock.name)}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.price !== undefined && data.price !== null) {
                            pricesMap[stock.name] = Number(data.price);
                        }
                    }
                } catch (e) {
                    console.log('Error fetching stock price:', e);
                }
            });

            const mfPromises = mutualFunds.map(async (mf) => {
                if (!mf.schemeCode) return;
                try {
                    const res = await fetch(`http://localhost:5000/api/mutualfunds/nav/${encodeURIComponent(mf.schemeCode)}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.nav !== undefined && data.nav !== null) {
                            navsMap[mf.schemeCode] = {
                                nav: Number(data.nav),
                                date: data.date,
                                fundHouse: data.fundHouse
                            };
                        }
                    }
                } catch (e) {
                    console.log('Error fetching MF NAV:', e);
                }
            });

            await Promise.all([...stockPromises, ...mfPromises]);

            if (isMounted) {
                setLivePrices(pricesMap);
                setLiveNavs(navsMap);
                setLoadingLive(false);
            }
        };

        if (stocks.length > 0 || mutualFunds.length > 0) {
            fetchAllLive();
        }

        return () => {
            isMounted = false;
        };
    }, [stocks, mutualFunds, token]);

    // Current Month & Expenses Calculations
    const date = new Date();
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const currentMonth = date.getMonth() + 1;
    const lastMonth = currentMonth - 1;

    const currentMonthData = expenses.filter((expense) => {
        const expense_date = new Date(expense.date);
        return currentMonth === (expense_date.getMonth() + 1);
    });

    const lastMonthData = expenses.filter((expense) => {
        const expense_date = new Date(expense.date);
        return lastMonth === (expense_date.getMonth() + 1);
    });

    const lastMonthExpenditure = lastMonthData.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const expenditure = currentMonthData.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const hasExpenseData = currentMonthData.length > 0;

    const percentageChange = lastMonthExpenditure === 0 
        ? 100 
        : ((expenditure - lastMonthExpenditure) / lastMonthExpenditure) * 100;
    const percentageChangeRounded = percentageChange.toFixed(1);

    const cumCategory = {};
    for (let i = 0; i < currentMonthData.length; i++) {
        cumCategory[currentMonthData[i].category] = (cumCategory[currentMonthData[i].category] || 0) + Number(currentMonthData[i].amount);
    }

    const max = Object.values(cumCategory).length > 0 ? Math.max(...Object.values(cumCategory)) : 0;
    const topCategory = Object.keys(cumCategory).filter(k => cumCategory[k] === max);

    const dateAndAmount = {};
    for (let i = 0; i < currentMonthData.length; i++) {
        dateAndAmount[currentMonthData[i].date] = (dateAndAmount[currentMonthData[i].date] || 0) + Number(currentMonthData[i].amount);
    }

    const dateAndAmountArray = Object.entries(dateAndAmount).map(([k, v]) => ({
        date: k.slice(0, 10),
        amount: v
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const monthAndAmount = {};
    for (let i = 0; i < expenses.length; i++) {
        const dateString = new Date(expenses[i].date);
        const name = dateString.toLocaleString('en-US', { month: 'long' });
        const year = dateString.getFullYear();
        const key = `${name} ${year}`;
        monthAndAmount[key] = (monthAndAmount[key] || 0) + Number(expenses[i].amount);
    }

    const monthAndAmountArray = Object.entries(monthAndAmount).map(([k, v]) => ({
        month: k,
        amount: v
    })).sort((a, b) => new Date(a.month) - new Date(b.month)).slice(-6);

    // ==========================================
    // STOCKS DETAILED CALCULATIONS
    // ==========================================
    const stockDetails = stocks.map((s) => {
        const qty = Number(s.quantity || 0);
        const avg = Number(s.avgPrice || 0);
        const invested = qty * avg;
        const live = livePrices[s.name] ?? avg;
        const currentVal = qty * live;
        const pnl = currentVal - invested;
        const pnlPercent = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : '0.00';
        return {
            ...s,
            qty,
            avg,
            invested,
            live,
            currentVal,
            pnl,
            pnlPercent,
            hasLive: livePrices[s.name] !== undefined
        };
    });

    const totalStocksInvested = stockDetails.reduce((sum, s) => sum + s.invested, 0);
    const totalStocksCurrentVal = stockDetails.reduce((sum, s) => sum + s.currentVal, 0);
    const totalStockPnL = totalStocksCurrentVal - totalStocksInvested;
    const totalStockPnLPercent = totalStocksInvested > 0 
        ? ((totalStockPnL / totalStocksInvested) * 100).toFixed(2) 
        : '0.00';
    const totalStockSIP = stocks.filter(s => s.sipEnabled).reduce((sum, s) => sum + Number(s.sipAmount || 0), 0);

    // Stock Comparison Chart Data
    const stockChartData = stockDetails.map(s => ({
        name: s.name.replace('.NS', '').replace('.BO', ''),
        Invested: Math.round(s.invested),
        Current: Math.round(s.currentVal)
    }));

    // ==========================================
    // MUTUAL FUNDS DETAILED CALCULATIONS
    // ==========================================
    const mfDetails = mutualFunds.map((mf) => {
        const units = Number(mf.units || 0);
        const navInfo = liveNavs[mf.schemeCode];
        const nav = navInfo ? Number(navInfo.nav) : null;
        const currentVal = nav !== null ? units * nav : 0;
        return {
            ...mf,
            units,
            nav,
            date: navInfo?.date,
            fundHouse: navInfo?.fundHouse,
            currentVal,
            hasNav: nav !== null
        };
    });

    const totalMFCurrentVal = mfDetails.reduce((sum, mf) => sum + mf.currentVal, 0);
    const totalMFUnits = mfDetails.reduce((sum, mf) => sum + mf.units, 0);
    const totalMFSIP = mutualFunds.filter(mf => mf.sipEnabled).reduce((sum, mf) => sum + Number(mf.sipAmount || 0), 0);

    // Mutual Fund Chart Data
    const mfChartData = mfDetails.map(mf => ({
        name: mf.name.length > 15 ? mf.name.substring(0, 15) + '...' : mf.name,
        Value: Math.round(mf.currentVal)
    }));

    // Unified Portfolio Metrics
    const totalPortfolioValue = totalStocksCurrentVal + totalMFCurrentVal;
    const totalMonthlySIP = totalStockSIP + totalMFSIP;

    return (
        <div className="container mt-4 mb-5">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0" style={{ fontWeight: '700', color: '#e8e0d0' }}>Financial Statistics</h1>
                    <p className="text-muted mb-0">Overview of expenses, equity holdings, and mutual funds portfolio</p>
                </div>
                {loadingLive && (
                    <span className="badge bg-secondary py-2 px-3">
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Fetching live market prices...
                    </span>
                )}
            </div>

            {/* Top Portfolio & Wealth Summary */}
            <div className="row g-3 mb-4">
                <div className="col-lg-3 col-md-6">
                    <div className="card p-3 h-100" style={{ borderLeft: '4px solid #3d5a80' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Investments Value</div>
                        <h3 className="mt-2 mb-0" style={{ color: '#e8e0d0', fontWeight: '700' }}>
                            ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h3>
                        <small className="text-muted mt-1">Stocks (₹{Math.round(totalStocksCurrentVal).toLocaleString('en-IN')}) + MF (₹{Math.round(totalMFCurrentVal).toLocaleString('en-IN')})</small>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6">
                    <div className="card p-3 h-100" style={{ borderLeft: '4px solid #28a745' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Stocks Overall Return</div>
                        <h3 className={`mt-2 mb-0 ${totalStockPnL >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontWeight: '700' }}>
                            {totalStockPnL >= 0 ? '+' : ''}₹{totalStockPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h3>
                        <small className="text-muted mt-1">{totalStockPnLPercent}% on ₹{totalStocksInvested.toLocaleString('en-IN')} invested</small>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6">
                    <div className="card p-3 h-100" style={{ borderLeft: '4px solid #c8b99a' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Monthly SIP Commitments</div>
                        <h3 className="mt-2 mb-0" style={{ color: '#c8b99a', fontWeight: '700' }}>
                            ₹{totalMonthlySIP.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h3>
                        <small className="text-muted mt-1">Stock SIPs: ₹{totalStockSIP} | MF SIPs: ₹{totalMFSIP}</small>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6">
                    <div className="card p-3 h-100" style={{ borderLeft: '4px solid #b0a898' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{monthName} Spending</div>
                        <h3 className="mt-2 mb-0" style={{ color: '#e8e0d0', fontWeight: '700' }}>
                            ₹{expenditure.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h3>
                        <small className={percentageChangeRounded >= 0 ? 'text-danger mt-1' : 'text-success mt-1'}>
                            {percentageChange > 0 ? '▲' : '▼'} {Math.abs(percentageChangeRounded)}% vs last month
                        </small>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* DETAILED STOCKS SECTION */}
            {/* ========================================================= */}
            <div className="card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3 className="mb-0" style={{ color: '#e8e0d0', fontWeight: '600' }}>Stocks & ETFs Details</h3>
                        <small className="text-muted">Breakdown of shares owned, invested capital, live market valuation, and P&L</small>
                    </div>
                    <Link to="/profile" className="btn btn-sm btn-outline-primary">
                        Manage Stocks in Profile
                    </Link>
                </div>

                {stocks.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <p className="mb-2">No stocks added to your portfolio yet.</p>
                        <Link to="/profile" className="btn btn-sm btn-primary">
                            + Add Stocks in Profile
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stock Performance Bar Chart */}
                        {stockChartData.length > 0 && (
                            <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#13151f', border: '1px solid #2a2d3a' }}>
                                <div className="text-muted mb-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    Invested Capital vs Current Market Value per Stock
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={stockChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                                        <XAxis dataKey="name" tick={{ fill: '#b0a898', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#b0a898', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e8e0d0' }}
                                            itemStyle={{ color: '#c8b99a' }}
                                        />
                                        <Legend wrapperStyle={{ color: '#e8e0d0', paddingTop: '10px' }} />
                                        <Bar dataKey="Invested" fill="#7a8fa6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Current" fill="#3d5a80" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Detailed Stocks Table */}
                        <div className="table-responsive">
                            <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #2a2d3a', color: '#7a8fa6', fontSize: '0.85rem' }}>
                                        <th>STOCK / SYMBOL</th>
                                        <th>SHARES OWNED</th>
                                        <th>AVG BUY PRICE</th>
                                        <th>TOTAL INVESTED</th>
                                        <th>LIVE MARKET PRICE</th>
                                        <th>CURRENT VALUE</th>
                                        <th>UNREALIZED P&L</th>
                                        <th>PORTFOLIO WEIGHT</th>
                                        <th>SIP SCHEDULE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockDetails.map((stock) => {
                                        const weight = totalStocksCurrentVal > 0 
                                            ? ((stock.currentVal / totalStocksCurrentVal) * 100).toFixed(1) 
                                            : '0';

                                        return (
                                            <tr key={stock._id} style={{ borderBottom: '1px solid #232736', verticalAlign: 'middle' }}>
                                                <td>
                                                    <span className="fw-bold" style={{ color: '#e8e0d0' }}>
                                                        {stock.name}
                                                    </span>
                                                </td>
                                                <td>{stock.qty}</td>
                                                <td>₹{stock.avg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                                <td>₹{stock.invested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                                <td>
                                                    {stock.hasLive ? (
                                                        <span className="fw-bold" style={{ color: '#e8e0d0' }}>
                                                            ₹{stock.live.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                            ₹{stock.avg} (Avg)
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="fw-bold" style={{ color: '#3d5a80' }}>
                                                        ₹{stock.currentVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${stock.pnl >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {stock.pnl >= 0 ? '+' : ''}₹{Math.round(stock.pnl).toLocaleString('en-IN')} ({stock.pnlPercent}%)
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span style={{ fontSize: '0.85rem', color: '#b0a898' }}>{weight}%</span>
                                                        <div className="progress flex-grow-1" style={{ height: '6px', backgroundColor: '#232736' }}>
                                                            <div 
                                                                className="progress-bar" 
                                                                role="progressbar" 
                                                                style={{ width: `${weight}%`, backgroundColor: '#3d5a80' }}
                                                            ></div>
                                                        </div>
                                                    </div>
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
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* ========================================================= */}
            {/* DETAILED MUTUAL FUNDS SECTION */}
            {/* ========================================================= */}
            <div className="card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3 className="mb-0" style={{ color: '#e8e0d0', fontWeight: '600' }}>Mutual Funds Details</h3>
                        <small className="text-muted">Total Units Owned: {totalMFUnits.toFixed(2)} • Breakdown of scheme units, latest AMFI NAV, total valuation, and SIPs</small>
                    </div>
                    <Link to="/profile" className="btn btn-sm btn-outline-primary">
                        Manage Funds in Profile
                    </Link>
                </div>

                {mutualFunds.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <p className="mb-2">No mutual funds added to your portfolio yet.</p>
                        <Link to="/profile" className="btn btn-sm btn-primary">
                            + Add Mutual Funds in Profile
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* MF Chart */}
                        {mfChartData.length > 0 && (
                            <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#13151f', border: '1px solid #2a2d3a' }}>
                                <div className="text-muted mb-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    Current Valuation per Mutual Fund Scheme
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={mfChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                                        <XAxis dataKey="name" tick={{ fill: '#b0a898', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#b0a898', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e8e0d0' }}
                                            itemStyle={{ color: '#c8b99a' }}
                                        />
                                        <Bar dataKey="Value" fill="#2b455a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Detailed Mutual Funds Table */}
                        <div className="table-responsive">
                            <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #2a2d3a', color: '#7a8fa6', fontSize: '0.85rem' }}>
                                        <th>SCHEME NAME</th>
                                        <th>UNITS OWNED</th>
                                        <th>LATEST NAV</th>
                                        <th>CURRENT VALUE</th>
                                        <th>FUND ALLOCATION</th>
                                        <th>SIP COMMITMENT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mfDetails.map((mf) => {
                                        const weight = totalMFCurrentVal > 0 
                                            ? ((mf.currentVal / totalMFCurrentVal) * 100).toFixed(1) 
                                            : '0';

                                        return (
                                            <tr key={mf._id} style={{ borderBottom: '1px solid #232736', verticalAlign: 'middle' }}>
                                                <td>
                                                    <div className="fw-bold" style={{ color: '#e8e0d0' }}>
                                                        {mf.name}
                                                    </div>
                                                    {mf.schemeCode && (
                                                        <small style={{ color: '#7a8fa6' }}>
                                                            Code: {mf.schemeCode} {mf.fundHouse && `• ${mf.fundHouse}`}
                                                        </small>
                                                    )}
                                                </td>
                                                <td>{mf.units.toFixed(3)}</td>
                                                <td>
                                                    {mf.hasNav ? (
                                                        <div>
                                                            <span className="fw-bold" style={{ color: '#e8e0d0' }}>
                                                                ₹{mf.nav.toFixed(2)}
                                                            </span>
                                                            {mf.date && (
                                                                <div style={{ fontSize: '0.75rem', color: '#7a8fa6' }}>
                                                                    As of {mf.date}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                            {loadingLive ? 'Fetching...' : 'N/A'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="fw-bold" style={{ color: '#3d5a80' }}>
                                                        ₹{mf.currentVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span style={{ fontSize: '0.85rem', color: '#b0a898' }}>{weight}%</span>
                                                        <div className="progress flex-grow-1" style={{ height: '6px', backgroundColor: '#232736' }}>
                                                            <div 
                                                                className="progress-bar" 
                                                                role="progressbar" 
                                                                style={{ width: `${weight}%`, backgroundColor: '#2b455a' }}
                                                            ></div>
                                                        </div>
                                                    </div>
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
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* ========================================================= */}
            {/* MONTHLY EXPENSES SECTION */}
            {/* ========================================================= */}
            <div className="card p-4">
                <h3 className="mb-3" style={{ color: '#e8e0d0', fontWeight: '600' }}>{monthName} Expenses Breakdown</h3>

                {!hasExpenseData ? (
                    <p className="text-muted">No expenses recorded for this month yet.</p>
                ) : (
                    <>
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <div className="card p-3 h-100" style={{ backgroundColor: '#13151f' }}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Total Expenditure:</span>
                                        <span className="fw-bold" style={{ color: '#e8e0d0' }}>₹{expenditure.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Previous Month:</span>
                                        <span className="fw-bold" style={{ color: '#e8e0d0' }}>₹{lastMonthExpenditure.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Percentage Change:</span>
                                        <span className={percentageChangeRounded >= 0 ? "text-danger fw-bold" : "text-success fw-bold"}>
                                            {percentageChange > 0 ? "▲" : "▼"} {Math.abs(percentageChangeRounded)} %
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Transactions Count:</span>
                                        <span className="fw-bold" style={{ color: '#e8e0d0' }}>{currentMonthData.length}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Top Category:</span>
                                        <span className="fw-bold" style={{ color: '#c8b99a' }}>{topCategory.join(', ')} (₹{max.toLocaleString('en-IN')})</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card p-3 h-100" style={{ backgroundColor: '#13151f' }}>
                                    <h5 className="mb-3" style={{ fontSize: '1rem', color: '#e8e0d0' }}>Category Breakdown</h5>
                                    {Object.entries(cumCategory).map(([k, v]) => (
                                        <div key={k} className="d-flex justify-content-between mb-2">
                                            <span style={{ color: '#b0a898' }}>{k}</span>
                                            <span className="fw-bold" style={{ color: '#e8e0d0' }}>₹{v.toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Daily Spending Trend */}
                        <h4 className="mt-4 mb-2" style={{ color: '#e8e0d0' }}>Daily Spending Trend</h4>
                        <div className="card p-3 mb-4" style={{ backgroundColor: '#13151f' }}>
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={dateAndAmountArray}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fill: '#b0a898', fontSize: 12 }}
                                        tickFormatter={(d) => d.slice(5)}
                                    />
                                    <YAxis tick={{ fill: '#b0a898', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#e8e0d0' }}
                                        itemStyle={{ color: '#c8b99a' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#3d5a80" 
                                        strokeWidth={2}
                                        dot={{ fill: '#c8b99a', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Monthly Overview */}
                        <h4 className="mt-4 mb-2" style={{ color: '#e8e0d0' }}>Monthly Overview (Last 6 Months)</h4>
                        <div className="card p-3" style={{ backgroundColor: '#13151f' }}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={monthAndAmountArray}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                                    <XAxis dataKey="month" tick={{ fill: '#b0a898', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#b0a898', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#e8e0d0' }}
                                        itemStyle={{ color: '#c8b99a' }}
                                    />
                                    <Bar dataKey="amount" fill="#3d5a80" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Statistics;