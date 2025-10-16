# Portfolio Backend API

A comprehensive backend API for portfolio management built with Node.js, Express, and PostgreSQL. This API provides complete portfolio management capabilities including user authentication, project showcases, blog posts, skills tracking, certifications, and advanced analytics dashboard.

## 🚀 Features

- **Authentication & Authorization**: JWT-based secure authentication system
- **Portfolio Management**: Complete CRUD operations for profiles, projects, and content
- **Blog System**: Full-featured blog with posts, tags, and view tracking
- **Skills & Certifications**: Professional skills and certification management
- **Analytics Dashboard**: Advanced statistics with PostgreSQL aggregations
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Data Seeding**: Comprehensive test data generation with faker.js
- **Security**: Rate limiting, input validation, and security headers
- **Database**: PostgreSQL with Sequelize ORM and migrations

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## ⚡ Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd portfolio-backend-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:setup

# Start development server
npm run dev
```

Visit `http://localhost:3000/api-docs` to explore the API documentation.

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step-by-step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-backend-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment** (see [Configuration](#configuration))

5. **Set up the database** (see [Database Setup](#database-setup))

6. **Start the server**
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_portfolio_db_0r2j
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `my_portfolio_db_0r2j` |
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE my_portfolio_db_0r2j;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE my_portfolio_db_0r2j TO your_username;
```

### 2. Run Migrations

```bash
# Run all migrations
npm run migrate

# Or set up everything at once
npm run db:setup
```

### 3. Seed Test Data (Optional)

```bash
# Generate comprehensive test data
npm run seed

# Generate demo user only
npm run seed:demo

# Generate development data (more content)
npm run seed:dev

# Custom data generation
npm run seed -- --users 5 --projects 10 --posts 15
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs/swagger.json`

### Generate Documentation

```bash
# Generate OpenAPI specification file
npm run docs:generate

# Start server with documentation
npm run docs:serve
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (hot reload)
npm start           # Start production server

# Database
npm run migrate     # Run migrations
npm run migrate:undo # Undo last migration
npm run seed        # Seed test data
npm run db:setup    # Migrate + seed
npm run db:reset    # Reset + migrate + seed

# Documentation
npm run docs:generate # Generate OpenAPI spec
npm run docs:serve   # Start server with docs

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

### Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.js  # Database connection
│   ├── jwt.js       # JWT configuration
│   └── swagger.js   # API documentation
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Sequelize models
├── routes/          # Route definitions
├── middlewares/     # Custom middleware
├── migrations/      # Database migrations
├── scripts/         # Utility scripts
└── utils/           # Helper utilities
```

## 🧪 Testing

### System Integration Test

```bash
# Run comprehensive system test
node src/scripts/systemTest.js
```

This test verifies:
- Database connection and models
- Middleware functionality
- Route definitions
- API documentation
- Environment configuration

### Manual Testing

1. **Start the server**: `npm run dev`
2. **Visit Swagger UI**: `http://localhost:3000/api-docs`
3. **Test authentication**: Use the `/api/auth/register` endpoint
4. **Explore endpoints**: Try different API operations

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   PORT=3000
   # Set production database credentials
   # Set secure JWT_SECRET
   ```

2. **Database Migration**
   ```bash
   npm run migrate
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Check

The API provides a health check endpoint:
- **GET** `/health` - Returns server status and environment info

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Profile Management
- `GET /api/profile/:user_id` - Get user profile
- `PUT /api/profile/:user_id` - Update profile

### Projects
- `GET /api/projects` - List projects (with pagination)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Blog Posts
- `GET /api/posts` - List posts (with pagination)
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Skills
- `GET /api/skills` - List skills
- `POST /api/skills` - Add skill
- `DELETE /api/skills/:id` - Remove skill

### Certificates
- `GET /api/certificates` - List certificates
- `POST /api/certificates` - Add certificate
- `DELETE /api/certificates/:id` - Remove certificate

### Dashboard Analytics
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/dashboard/weekly-views` - Weekly views chart data
- `GET /api/dashboard/projects-timeline` - Projects timeline data

For complete API documentation with request/response examples, visit the Swagger UI at `/api-docs`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](http://localhost:3000/api-docs)
2. Run the system test: `node src/scripts/systemTest.js`
3. Check the server logs for error details
4. Open an issue in the repository

## 🎯 Roadmap

- [ ] WebSocket support for real-time updates
- [ ] File upload functionality for images
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] API rate limiting per user
- [ ] Caching layer with Redis
- [ ] Automated testing suite
- [ ] Performance monitoring