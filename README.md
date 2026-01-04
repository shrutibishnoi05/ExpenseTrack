# Expense Tracker - Full Stack Application

A production-ready, full-stack expense tracking web application built with modern technologies and best practices.

![Dashboard Preview](docs/dashboard-preview.png)

## 🚀 Features

### Authentication & Security
- ✅ User signup/login with email & password
- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Password hashing with bcrypt
- ✅ Protected routes & role-based access control
- ✅ Forgot & reset password flow

### Expense Management
- ✅ Add, edit, delete expenses
- ✅ Categorize with color-coded categories
- ✅ Multiple payment methods
- ✅ Recurring expense support
- ✅ Receipt image upload
- ✅ Notes and descriptions

### Budget & Analytics
- ✅ Monthly budget setup
- ✅ Budget alerts (warning & over-budget)
- ✅ Category-wise spending breakdown
- ✅ Income vs expense comparison
- ✅ Interactive charts (pie, bar, line, area)
- ✅ Spending trends analysis

### Export & Reports
- ✅ Export to CSV
- ✅ Export to PDF
- ✅ Monthly expense reports

### Admin Features
- ✅ View all users
- ✅ Block/unblock users
- ✅ Platform statistics

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** components
- **Recharts** for data visualization
- **React Hook Form** + **Zod** for form validation
- **Axios** for API calls

### Backend
- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Zod** for validation
- **Swagger/OpenAPI** for documentation

## 📁 Project Structure

```
ExpenseTrack/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/         # Database & app config
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript interfaces
│   │   ├── utils/          # Helpers & utilities
│   │   └── app.ts          # Express app entry
│   ├── .env.example
│   └── package.json
│
├── frontend/                # Next.js application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities & API client
│   │   ├── providers/      # Context providers
│   │   └── types/          # TypeScript types
│   ├── .env.local
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your MongoDB URI and secrets

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`
API documentation at `http://localhost:5000/api-docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🐳 Docker Deployment

Run the entire stack with Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses (with filters) |
| GET | `/api/expenses/:id` | Get single expense |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create custom category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Dashboard summary |
| GET | `/api/analytics/trends` | Spending trends |
| GET | `/api/analytics/yearly` | Yearly summary |
| GET | `/api/analytics/daily` | Daily spending |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/csv` | Export to CSV |
| GET | `/api/export/pdf` | Export to PDF |

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:5000/uploads
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend build check
cd frontend
npm run build
```

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using Next.js, Express, and MongoDB
