# Future Saver — Developer Manual

> This document is intended for future developers who will take over and continue development of the Future Saver application. It assumes general knowledge of web development, Node.js, and REST APIs, but no prior knowledge of this specific system.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Environment Variables](#environment-variables)
5. [Database Setup (Supabase)](#database-setup-supabase)
6. [API Endpoints](#api-endpoints)
7. [Testing](#testing)
8. [Known Bugs](#known-bugs)
9. [Roadmap for Future Development](#roadmap-for-future-development)

---

## System Overview

Future Saver is a personal finance web application built with:

- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **External API:** Financial Modeling Prep (FMP) for live stock market data
- **Libraries:** Chart.js (data visualization), AOS (scroll animations)

The application walks users through a 5-step onboarding flow (Personal Info → Goals → Debt → Investments → Review), then displays a live financial dashboard.

---

## Installation

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [Supabase](https://supabase.com/) account
- A [Financial Modeling Prep](https://financialmodelingprep.com/) account (free tier works)

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/your-username/future-saver.git
cd future-saver
```

**2. Install dependencies**

```bash
npm install
```

The project depends on the following packages:

| Package | Purpose |
|---|---|
| `express` | Web server framework |
| `@supabase/supabase-js` | Supabase database client |
| `dotenv` | Load environment variables from `.env` |

---

## Running the Application

**1. Create your `.env` file** (see [Environment Variables](#environment-variables) below)

**2. Start the server**

```bash
node server.js
```

**3. Open the app in your browser**

```
http://localhost:3000
```

The server serves all frontend files statically from the `public/` directory.

To run with auto-restart on file changes, install and use `nodemon`:

```bash
npm install -g nodemon
nodemon server.js
```

---

## Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
FMP_API_KEY=your_financial_modeling_prep_api_key
```

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `SUPABASE_KEY` | Supabase Dashboard → Project Settings → API → anon public key |
| `FMP_API_KEY` | financialmodelingprep.com → Dashboard → API Key |

> **Important:** Never commit your `.env` file to GitHub. Make sure `.env` is listed in your `.gitignore`.

---

## Database Setup (Supabase)

The application uses four tables in Supabase. Create them using the Supabase Table Editor or SQL editor.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `name` | `text` | User's full name |
| `monthly_income` | `numeric` | Monthly income in dollars |
| `monthly_expenses` | `numeric` | Monthly expenses in dollars |
| `created_at` | `timestamp` | Auto-generated |

### `goals`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `user_id` | `uuid` | Foreign key → `users.id` |
| `icon` | `text` | Emoji icon string |
| `name` | `text` | Goal name |
| `already_saved` | `numeric` | Amount already saved |
| `target_amount` | `numeric` | Target savings amount |
| `target_date` | `date` | Goal target date |
| `created_at` | `timestamp` | Auto-generated |

### `debts`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `user_id` | `uuid` | Foreign key → `users.id` |
| `type` | `text` | Debt type (e.g. Credit Card) |
| `name` | `text` | Debt name |
| `balance` | `numeric` | Current balance |
| `original` | `numeric` | Original loan amount |
| `interest` | `numeric` | Interest rate % |
| `payment` | `numeric` | Monthly payment amount |
| `created_at` | `timestamp` | Auto-generated |

### `investments`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `user_id` | `uuid` | Foreign key → `users.id` |
| `total_invested` | `numeric` | Total amount invested |
| `year_return` | `numeric` | Year-to-date return % |
| `credit_score` | `integer` | Credit score (300–850) |
| `credit_label` | `text` | Label (Poor, Fair, Good, etc.) |
| `created_at` | `timestamp` | Auto-generated |

---

## API Endpoints

All endpoints are defined in `server.js`. The base URL is `http://localhost:3000`.

---

### Users

#### `POST /api/users`
Creates a new user record.

**Request body:**
```json
{
  "name": "Jane Doe",
  "monthlyIncome": 5000,
  "monthlyExpenses": 2000
}
```

**Response:** The created user object including the generated `id`.

---

#### `GET /api/users/:userId`
Retrieves a single user by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "monthly_income": 5000,
  "monthly_expenses": 2000
}
```

---

### Goals

#### `POST /api/goals`
Saves one or more savings goals for a user.

**Request body:**
```json
{
  "userId": "uuid",
  "goals": [
    {
      "icon": "🏠",
      "name": "House Fund",
      "alreadySaved": 5000,
      "targetAmount": 50000,
      "targetDate": "2027-01-01"
    }
  ]
}
```

**Response:** Array of inserted goal objects.

---

#### `GET /api/goals/:userId`
Retrieves all goals for a user.

**Response:** Array of goal objects.

---

### Debts

#### `POST /api/debts`
Saves one or more debts for a user.

**Request body:**
```json
{
  "userId": "uuid",
  "debts": [
    {
      "type": "Credit Card",
      "name": "Chase Sapphire",
      "balance": 3200,
      "original": 5000,
      "interest": 19.9,
      "payment": 200
    }
  ]
}
```

**Response:** Array of inserted debt objects.

---

#### `GET /api/debts/:userId`
Retrieves all debts for a user.

**Response:** Array of debt objects.

---

### Investments

#### `POST /api/investments`
Saves investment and credit data for a user.

**Request body:**
```json
{
  "userId": "uuid",
  "totalInvested": 10000,
  "yearReturn": 7.5,
  "creditScore": 750,
  "creditLabel": "Very Good"
}
```

**Response:** The created investment object.

---

#### `GET /api/investments/:userId`
Retrieves investment data for a user, ordered by most recent.

**Response:** Array of investment objects.

---

### Market Data

#### `GET /api/market`
Fetches live stock quotes for AAPL, MSFT, TSLA, and NVDA from the Financial Modeling Prep API.

**Response:**
```json
[
  {
    "ticker": "AAPL",
    "price": 189.45,
    "change": 1.23,
    "changePercent": 0.65,
    "date": "2026-05-07"
  }
]
```

---

#### `GET /api/market/history/:symbol`
Fetches 30 days of historical price data for a given stock symbol.

**Example:** `GET /api/market/history/AAPL`

**Response:**
```json
[
  { "date": "2026-04-07", "price": 182.10 },
  { "date": "2026-04-08", "price": 184.55 }
]
```

---

## Testing

The project does not currently have an automated test suite. To manually test each feature:

**1. Onboarding flow**
- Start at `index.html`
- Fill in personal info, goals, debts, investments
- Confirm data appears on the review page
- Confirm data appears on the dashboard

**2. API endpoints**
Use a tool like [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) to test each endpoint manually.

Example test for creating a user:
```
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "Test User",
  "monthlyIncome": 4000,
  "monthlyExpenses": 1500
}
```

**3. Stock market data**
Visit `http://localhost:3000/api/market` directly in your browser to confirm live data is returned.

> For future development, consider adding automated tests using [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest) for endpoint testing.

---

## Known Bugs

| Bug | Description | Workaround |
|---|---|---|
| Duplicate user sessions | Every time a user completes onboarding, a new user record is created. There is no login system, so refreshing and re-submitting creates duplicate data. | Clear `localStorage` between sessions or delete old rows in Supabase manually. |
| FMP API free tier limit | The Financial Modeling Prep free plan allows 250 API calls per day. Exceeding this returns an error and stock data will not load. | Upgrade the FMP plan or implement response caching on the server. |
| No input validation on the server | The server trusts all incoming data from the frontend without validating types or required fields. | Add server-side validation using a library like `express-validator`. |
| Investments overwrite issue | Each time a user submits the investments form, a new row is inserted rather than updating the existing one. | Use an `upsert` instead of `insert` in the investments POST route. |
| No authentication | Any user with a valid `userId` stored in `localStorage` can access any other user's data by changing the ID. | Implement proper authentication using Supabase Auth or JWT tokens. |

---

## Roadmap for Future Development

The following features and improvements are recommended for future development:

**Authentication**
Implement a proper login and registration system using Supabase Auth so users can log in across devices and sessions are secure.

**Edit & Delete**
Add the ability for users to edit or delete existing goals, debts, and investments directly from the dashboard without going through the full onboarding flow again.

**Budget Tracker**
Add a monthly budget tracking page where users can log individual transactions and see spending by category.

**Push Notifications**
Send users reminders when they are close to a savings goal target date or when a debt payment is due.

**Mobile App**
Convert the frontend to a React Native or PWA application so users can access Future Saver on their phones.

**More Stock Tickers**
Allow users to search for and add custom stock tickers to their dashboard market view rather than being limited to the four hardcoded ones.

**Server-side Caching**
Cache FMP API responses for a few minutes on the server to reduce API call usage and improve dashboard load speed.

**Automated Testing**
Write unit and integration tests using Jest and Supertest to cover all API endpoints and critical frontend logic.
