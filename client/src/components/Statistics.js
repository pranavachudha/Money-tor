import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function Statistics({expenses}) {
    const date = new Date();
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const currentMonth = date.getMonth() + 1;
    const lastMonth = currentMonth - 1;


    const currentMonthData = expenses.filter((expense) => {
        const dateString = expense.date;
        const expense_date = new Date(dateString);

        const expense_month = expense_date.getMonth() + 1;
    
        if (currentMonth === expense_month) {
            return true;
        }

        return false;
    })

    const lastMonthData = expenses.filter((expense) => {
        const dateString = expense.date;
        const expense_date = new Date(dateString);

        const expense_month = expense_date.getMonth() + 1;
    
        if (lastMonth === expense_month) {
            return true;
        }

        return false;
    })

    const lastMonthExpenditure = lastMonthData.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const expenditure = currentMonthData.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const hasData = currentMonthData.length > 0;

    const percentageChange = lastMonthExpenditure === 0 
        ? 100 
        : ((expenditure - lastMonthExpenditure) / lastMonthExpenditure) * 100;
    const percentageChangeRounded = percentageChange.toFixed(1);

    const cumCategory = {};

    for (let i = 0; i < currentMonthData.length; i++) {
        cumCategory[currentMonthData[i].category] = (cumCategory[currentMonthData[i].category] || 0) + currentMonthData[i].amount;
    }

    const max = Math.max(...Object.values(cumCategory))
    const topCategory = Object.keys(cumCategory).filter(k => cumCategory[k] === max);
    
    const dateAndAmount = {};
    for (let i = 0; i < currentMonthData.length; i++) {
        dateAndAmount[currentMonthData[i].date] = (dateAndAmount[currentMonthData[i].date] || 0) + currentMonthData[i].amount;
    }

    const dateAndAmountArray = Object.entries(dateAndAmount).map(([k, v]) => {
        return { "date" : k.slice(0, 10), "amount": v};
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const monthAndAmount = {};
    for (let i = 0; i < expenses.length; i++) {
        const dateString= new Date(expenses[i].date);
        const monthName = dateString.toLocaleString('en-US', { month: 'long' });
        const year = dateString.getFullYear()
        const key = `${monthName} ${year}`; 
        monthAndAmount[key] = (monthAndAmount[key] || 0) + expenses[i].amount;
    }

    const monthAndAmountArray = Object.entries(monthAndAmount).map(([k, v]) => {
         return { "month" : k, "amount": v};
    }).sort((a, b) => new Date(a.month) - new Date(b.month))
    .slice(-6);


    return (
        <>
        {!hasData ? (
            <div className="container mt-4"> <p className="text-muted">No expenses this month yet.</p></div>
           
        ): (
            
            <div className="container mt-4">
                <h1>{monthName} Summary</h1>
                <div className="row g-5">
                    <div className="col-12 ">
                        <div className="card p-3 mt-2">
                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Total Expenditure</h5>
                                <h5 className="mb-0"><span className="text-primary">INR </span>{expenditure}</h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Previous Month Expenditure</h5>
                                <h5 className="mb-0"><span className="text-primary">INR </span>{lastMonthExpenditure}</h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Percentage Change</h5>
                                <h5 className={percentageChangeRounded >= 0? "text-danger mb-0" : "text-success mb-0"}>
                                    {percentageChange > 0 ? "▲" : "▼"} {Math.abs(percentageChangeRounded)} %
                                </h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Number of Transactions</h5>
                                <h5 className="mb-0">{currentMonthData.length}</h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Top Category</h5>
                                <h5 className="mb-0">{topCategory}</h5>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="mb-0">Top Category Expense</h5>
                                <h5 className="mb-0"><span className="text-primary">INR </span>{max}</h5>
                            </div>
                        </div>
                    </div>

                   
                </div>
                
                <h1 className="mt-5">Categories</h1>
                <div className="row">
                    <div className="col-12">
                        <div className="card p-3 mt-2">
                            {
                                Object.entries(cumCategory).map(([k, v]) => {
                                    return (
                                        <div key={k} className="d-flex justify-content-between mb-2">
                                            <h5 className="mb-0">{k}</h5>
                                            <h5 className="mb-0"><span className="text-primary">INR </span>{v}</h5>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

                <h1 className="mt-5">Daily Spending Trend</h1>
                <div className="row">
                    <div className="col-12">
                        <div className="card p-3 mt-2">
                                <ResponsiveContainer width="100%" height={300} className="mt-3">
                                <LineChart data={dateAndAmountArray}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fill: '#b0a898', fontSize: 12 }}
                                    tickFormatter={(date) => date.slice(5)}
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
                    </div>
                </div>

                <h1 className="mt-5">Monthly Overview</h1>
                <div className="row">
                <div className="col-12">
                    <div className="card p-3 mt-2">
                    <ResponsiveContainer width="100%" height={300}>
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
                </div>
                </div>
            </div>
            

        )}
        </>

    )   
}

export default Statistics;