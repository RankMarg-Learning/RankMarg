# Passport.js Authentication Architecture

## Overview

This document describes the authentication architecture for the RankMarg application. We have implemented a Passport.js-based authentication system in the backend while maintaining the NextAuth.js frontend integration. This approach provides robust security and flexibility while supporting various authentication methods.

## Architecture Components

### Backend (Passport.js)

The backend uses Passport.js for authentication with the following components:

1. **JWT Strategy**: Authenticates API requests using JWT tokens
2. **Google OAuth Strategy**: Provides Google sign-in functionality
3. **Passport Middleware**: Protects routes based on authentication and role requirements

### Frontend (NextAuth.js)

The frontend continues to use NextAuth.js for session management with these components:

1. **Credentials Provider**: Connects to the backend for username/password authentication
2. **Session Management**: Stores authentication state in client cookies
3. **Passport Adapter**: Custom adapter that connects NextAuth to our Passport.js backend

## Authentication Flows

### Sign-Up Flow

1. User submits the registration form
2. Frontend sends registration data to `/api/auth/sign-up` endpoint
3. Backend validates data and creates a new user account with a hashed password
4. Backend creates a trial subscription for the new user
5. User is redirected to the sign-in page

### Sign-In Flow

1. User submits credentials in the sign-in form
2. NextAuth passes credentials to the Passport adapter
3. Backend validates credentials and generates a JWT token
4. Backend returns user data and token to the frontend
5. NextAuth stores the authentication state in a secure client-side session
6. User is redirected to the dashboard

### Google OAuth Flow

1. User clicks "Sign in with Google" button
2. User is redirected to the backend's `/api/auth/google` endpoint
3. Passport.js initiates the Google OAuth flow
4. User authenticates with Google and grants permissions
5. Google redirects back to our callback endpoint with an authentication code
6. Backend validates the code, retrieves user information, and creates/updates the user in our database
7. Backend issues a JWT token and redirects to the frontend with the token
8. Frontend validates the token and establishes a session
9. User is redirected to the dashboard or onboarding page

## Security Features

### JWT-Based Authentication

- Tokens are signed with a secret key stored in server environment variables
- Token expiration is set to 30 days (configurable)
- Tokens contain minimal user information for security

### Password Security

- Passwords are hashed using bcrypt with appropriate work factor
- No plaintext passwords are ever stored or transmitted
- Password validation rules enforce strong passwords

### Session Management

- Session cookies are HTTP-only and secure in production
- Session data is encrypted
- Proper CORS configuration to prevent cross-origin issues

### Role-Based Access Control

- Middleware functions validate user roles for protected routes
- Different permission levels for users, instructors, and admins
- Resource ownership validation for user-specific data

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/sign-up`: Create a new user account
- `POST /api/auth/sign-in`: Authenticate user and get JWT token
- `GET /api/auth/check-username`: Check if a username is available
- `GET /api/auth/google`: Initiate Google OAuth flow
- `GET /api/auth/google/callback`: Handle Google OAuth callback
- `GET /api/auth/profile`: Get current user profile (authenticated route)

### Protected API Pattern

All protected APIs follow this pattern:

1. Request arrives with JWT token in Authorization header
2. Passport.js authenticates the token and attaches user data to the request
3. Additional middleware may check roles or permissions
4. Controller handles the authenticated request

## Frontend Integration

### NextAuth Configuration

- Custom credentials provider that works with the backend
- JWT session strategy for consistent authentication
- Callbacks for transforming tokens and session data

### Passport Adapter

The passport adapter provides:

- Registration functionality
- Username availability checking
- Google authentication redirection
- Profile retrieval

## Error Handling

- Consistent error responses with appropriate status codes
- Detailed validation error messages
- Security-conscious error responses (no leaking of sensitive information)

## Future Improvements

1. **Refresh Token Strategy**: Implement short-lived access tokens with refresh tokens
2. **Email Verification**: Add email verification for new accounts
3. **Password Reset**: Implement forgotten password flow
4. **Rate Limiting**: Add rate limiting for authentication endpoints
5. **MFA Support**: Add multi-factor authentication options
6. **OAuth Expansion**: Add more OAuth providers (Apple, Facebook, etc.)

## Deployment Considerations

- Ensure secure transmission of tokens (HTTPS)
- Set appropriate CORS headers
- Configure session cookie settings based on environment
- Store secrets in environment variables

## Conclusion

This authentication architecture provides a robust and flexible solution by combining the strengths of Passport.js for backend authentication with NextAuth.js for frontend session management. This approach allows us to maintain security and scalability while providing a seamless user experience.
