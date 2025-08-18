# SchoolSphere Administrator Authentication

This document provides instructions for setting up and testing the production-ready authentication system for SchoolSphere, with a focus on Administrator role access.

## Authentication Options

SchoolSphere now supports three authentication methods:

1. **Development Authentication** (for local development)
   - Enabled with `USE_DEV_AUTH=1`
   - Provides mock users with no database requirement
   - Access via `/dev-login` or auto-login route

2. **Custom Authentication** (for production)
   - Enabled with `USE_CUSTOM_AUTH=1`
   - Uses secure password storage with bcrypt
   - Stores sessions in PostgreSQL
   - Access via `/admin-login` route

3. **Replit OIDC Authentication** (for Replit deployment)
   - Default when neither USE_DEV_AUTH nor USE_CUSTOM_AUTH are set
   - Uses Replit's OIDC provider
   - Handles automatic token refresh

## Administrator Role

The Administrator role (also referred to as "owner" in the database schema) has full access to all SchoolSphere features, including:

- User management
- Organization settings
- Branch management
- Content management
- Event creation and management
- Social media integrations
- Analytics and reporting

## Setup Instructions

### Production Setup

1. Configure environment variables:
   ```
   # Required
   DATABASE_URL=postgres://user:pass@host/db?sslmode=require
   SESSION_SECRET=your-secure-random-string
   USE_CUSTOM_AUTH=1
   
   # Administrator account
   ADMIN_EMAIL=your-admin-email@domain.com
   ADMIN_PASSWORD=your-secure-password
   
   # Only enable during initial setup
   ALLOW_ADMIN_SETUP=1
   ```

2. Run the production startup script:
   ```
   ./prod.sh
   ```

3. For first-time setup, with `ALLOW_ADMIN_SETUP=1`, you can also create an admin via the API:
   ```
   curl -X POST http://localhost:5000/api/auth/setup-admin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"SecurePassword123!","firstName":"Admin","lastName":"User"}'
   ```

4. After setup, disable admin creation by setting `ALLOW_ADMIN_SETUP=0`

## Testing Administrator Access

To test that the Administrator has proper access:

1. Navigate to `/admin-login` in your browser
2. Enter the admin credentials (email/password)
3. Verify you can access all sections of the application:
   - Dashboard
   - Users
   - Content
   - Events
   - Social
   - Settings
   - Branch Management

## Security Considerations

- The administrator password is securely hashed using bcrypt
- Sessions are stored in PostgreSQL with appropriate expiration
- All authentication routes use HTTPS in production
- Failed login attempts are logged (but not currently rate-limited)
- Session cookies use secure and HTTP-only flags in production

## Troubleshooting

- If login fails, verify the DATABASE_URL is correct and the database is accessible
- Check that the ADMIN_EMAIL and password match what's configured
- Ensure USE_CUSTOM_AUTH=1 is set in your environment
- Check server logs for any authentication errors
