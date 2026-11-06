# Money-tor

A full-stack personal finance tracker built with the MERN stack. Track daily expenses, manage a stock and mutual fund portfolio with live prices, and see your spending and investments in one statistics dashboard.

## Features

- **Authentication:** register and log in with JWT-based auth; passwords are hashed with bcrypt.
- **Per-user data isolation:** every record belongs to a user, and all routes are protected by auth middleware.
- **Expense tracking:** add, edit and delete expenses with category, description, amount and date, plus a running total.
- **Stock portfolio:**
  - Search stocks and ETFs as you type (debounced search, Indian `.NS` / `.BO` symbols preferred).
  - Live prices from Yahoo Finance, with invested value, current value and profit/loss.
  - Optional SIP details (amount and day of month).
- **Mutual fund portfolio:**
  - Search funds by name through mfapi.in.
  - Latest NAV, fund house and current value (units x NAV).
  - Optional SIP details.
- **Financial profile:** store gross monthly income and monthly budget.
- **Statistics dashboard (Recharts):**
  - Monthly spending summary and month-over-month change
  - Category breakdown and top category
  - Daily spending trend and monthly overview charts
  - Portfolio weight per stock and fund, total investments and SIP commitments

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Bootstrap / React-Bootstrap, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens, bcryptjs |
| Market data | Yahoo Finance (stock search and prices), mfapi.in (mutual fund NAV) |

## Project Structure

```
Money-tor/
├── client/
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       └── components/
│           ├── Login.js, Register.js, NavBar.js, PrivateRoute.js
│           ├── ExpenseForm.js, ExpenseList.js, ExpenseItem.js
│           ├── StockForm.js, StockList.js
│           ├── MutualFundForm.js, MutualFundList.js
│           ├── Profile.js
│           └── Statistics.js
└── server/
    ├── index.js
    ├── middleware/auth.js
    ├── models/        (User, Expense, Finance, Stocks, MutualFunds)
    ├── routes/        (auth, expenses, finance, stocks, mutualfunds)
    └── resetpassword.js
```

## Getting Started

### Prerequisites

- Node.js 18 or newer (the server uses the built-in `fetch`)
- A MongoDB database (local or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/pranavachudha/Money-tor.git
cd Money-tor
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

Start the server:

```bash
node index.js
```

The API runs on `http://localhost:5000`. You can check it with `GET /api/test`.

### 3. Set up the client

```bash
cd client
npm install
npm start
```

The client expects the API at `http://localhost:5000`.

## API Overview

All routes except register and login require the header `Authorization: Bearer <token>`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Expenses | `GET /api/expenses`, `POST /api/expenses`, `PUT /api/expenses/:id`, `DELETE /api/expenses/:id` |
| Finance profile | `GET /api/finance`, `POST /api/finance` (create or update) |
| Stocks | `GET /api/stocks`, `GET /api/stocks/search?q=`, `GET /api/stocks/price/:symbol`, `POST /api/stocks`, `PUT /api/stocks/:id`, `DELETE /api/stocks/:id` |
| Mutual funds | `GET /api/mutualfunds`, `GET /api/mutualfunds/nav/:schemeCode`, `POST /api/mutualfunds`, `PUT /api/mutualfunds/:id`, `DELETE /api/mutualfunds/:id` |

## How Authentication Works

1. On register or login, the server returns a JWT (valid for 7 days) containing the user id.
2. The client stores the token and sends it with every request.
3. The auth middleware verifies the token and exposes `req.user.id`, which every route uses to read and write only that user's data.

## Roadmap

- Forgot-password flow (reset token fields are already in the user model)
- Environment-based API URL for deployment
- Purchase cost for mutual funds to calculate returns
- Debts module
- Input validation, rate limiting and automated tests

## Notes

Stock prices come from Yahoo Finance's unofficial endpoints, which may change or rate-limit. This project is for personal tracking and learning, not financial advice.

## Author

Pranav Achudha S, [@pranavachudha](https://github.com/pranavachudha)
