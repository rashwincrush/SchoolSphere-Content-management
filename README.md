# EduConnect - Multi-Tenant School Management SaaS Platform

A comprehensive multi-tenant SaaS platform for educational institutions featuring event management, content creation, social media automation, multilingual support, and advanced parent engagement tools.

## Overview

EduConnect provides subscription-based access to a full suite of school management tools including event coordination, content management, social media automation, parent portals, and real-time analytics. Built with modern web technologies and designed for scalability across multiple branches and organizations.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: Express.js + TypeScript + Node.js 20
- **Database**: PostgreSQL (Neon serverless) + Drizzle ORM
- **Authentication**: Replit OIDC with session management
- **Build Tools**: Vite (frontend) + ESBuild (backend)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Replit Autoscale

## Monorepo Layout

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages/routes
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React context providers
│   │   └── lib/          # Utilities and helpers
│   └── test/             # Test setup and utilities
├── server/                # Express backend application
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API route definitions
│   ├── db.ts             # Database connection setup
│   ├── replitAuth.ts     # OIDC authentication setup
│   ├── security.ts       # CORS and rate limiting
│   └── storage.ts        # Data access layer
├── shared/                # Shared TypeScript definitions
│   └── schema.ts         # Database schema and types
└── attached_assets/       # Static assets and uploads
```

## Environment Variables

### Required (Auto-provided by Replit)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session security key
- `REPL_ID` - Replit project ID (OIDC client_id)
- `REPLIT_DOMAINS` - Replit domain for OIDC callbacks
- `PORT` - Server port (defaults to 5000)

### Optional (Manual Setup)
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `VITE_STRIPE_PUBLIC_KEY` - Frontend Stripe integration
- `ISSUER_URL` - OIDC issuer (defaults to https://replit.com/oidc)

## Development

### Prerequisites
All dependencies are managed through Replit. The environment includes Node.js 20, PostgreSQL 16, and web development tools.

### Setup
```bash
# Install dependencies (auto-handled by Replit)
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Development Server
- **Frontend**: Served via Vite with hot module replacement
- **Backend**: TypeScript execution via tsx with auto-reload
- **Database**: PostgreSQL with automatic session table creation
- **Port**: 5000 (mapped to external port 80)

## Build

### Production Build
```bash
npm run build
```

This creates:
- `dist/public/` - Optimized React frontend build
- `dist/index.js` - Compiled Express server bundle

### Build Process
1. **Frontend**: Vite optimizes React app with code splitting
2. **Backend**: ESBuild compiles TypeScript to ESM bundle
3. **Assets**: Static files copied to distribution directory

## Deploy (Replit Autoscale)

### Automatic Deployment
1. Click "Deploy" button in Replit interface
2. Replit Autoscale handles build and deployment automatically
3. Access your app at: `https://{repl-name}-{username}.replit.app/`

### Deployment Configuration
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
```

### Scaling
- **Auto-scaling**: Scales to zero when idle
- **Performance**: Optimized for request/response workloads
- **Billing**: Pay-per-use based on actual traffic

## Authentication (Replit OIDC)

### OIDC Flow
- **Provider**: Replit as OpenID Connect issuer
- **Issuer URL**: https://replit.com/oidc
- **Client ID**: Uses REPL_ID environment variable
- **Callback**: `/api/callback` endpoint
- **Session**: HTTPOnly cookies with PostgreSQL storage

### Endpoints
- `GET /api/login` - Initiates OIDC authentication
- `GET /api/callback` - Handles OIDC callback
- `GET /api/logout` - Ends session and redirects
- `GET /api/auth/user` - Returns authenticated user info

## Database (Neon + Drizzle)

### Connection
- **Driver**: @neondatabase/serverless with WebSocket support
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Code-first schema with `drizzle-kit push`

### Schema Management
```bash
# Push schema changes to database
npm run db:push

# Check TypeScript types
npm run check
```

### Multi-Tenant Architecture
- **Organizations**: Primary tenant isolation
- **Branches**: Sub-organization management
- **Users**: Role-based access (owner, admin, teacher, parent, student)
- **Data Isolation**: All queries filtered by organization/branch context

## Security

### CORS Protection
- Restricts origins to Replit domains and localhost
- Supports credentials for authenticated requests
- Configurable allowed headers and methods

### Rate Limiting
- **API Routes**: 300 requests per 15 minutes per IP
- **Auth Routes**: 20 requests per 15 minutes per IP
- **Headers**: Standard rate limit headers included

### Session Security
- HTTPOnly cookies prevent XSS attacks
- Secure flag enabled in production
- PostgreSQL-backed session store
- 1-week session expiration

## Testing (Vitest)

### Test Setup
```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run coverage
```

### Testing Framework
- **Vitest**: Vite-native testing framework
- **React Testing Library**: Component testing utilities
- **jsdom**: Browser environment simulation
- **Jest DOM**: Additional DOM matchers

## Health Monitoring

### Health Check
```bash
GET /healthz
```

Response:
```json
{
  "ok": true,
  "uptime": 12345.678
}
```

### Monitoring
- Request logging with duration tracking
- Error handling with proper status codes
- Performance metrics in development logs

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Start OIDC login
- `GET /api/logout` - End session

### Core Features
- `GET/POST /api/events` - Event management
- `GET/POST /api/posts` - Content management
- `GET /api/analytics/*` - Analytics data
- `GET /api/notifications` - User notifications
- `PATCH /api/profile` - Update user profile
- `GET/POST /api/branches` - Branch management

### Organization Management
- `GET/PATCH /api/organization` - Organization settings
- `PATCH /api/settings` - System configuration
- `GET /api/users` - User management (admin only)

## License

MIT License - see LICENSE file for details.

---

## Quick Start

1. **Clone/Fork** this Replit project
2. **Set Secrets** in Replit Tools → Secrets:
   - `DATABASE_URL` (your PostgreSQL connection)
   - `SESSION_SECRET` (long random string)
3. **Push Schema**: Run `npm run db:push`
4. **Start Dev**: Run `npm run dev`
5. **Deploy**: Click "Deploy" button for production

Your app will be available at `https://{repl-name}-{username}.replit.app/`