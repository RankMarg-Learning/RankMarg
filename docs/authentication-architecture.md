# Authentication Architecture

## Overview

This document describes the authentication architecture for the RankMarg application. We've moved the authentication logic from the Next.js frontend to the Node.js backend, creating a more secure and scalable architecture.

## Architecture Components

### 1. Backend Authentication Services

The backend handles core authentication functionality:

- **User registration** - Creating new user accounts
- **User authentication** - Validating credentials and issuing JWT tokens
- **OAuth integration** - Supporting third-party authentication (Google)
- **Token management** - Issuing, validating, and refreshing JWT tokens

### 2. Frontend Authentication Adapter

The frontend uses an adapter pattern to connect to the backend authentication services:

- **NextAuth Integration** - Custom NextAuth providers that communicate with backend
- **Backend API Integration** - Direct API calls for authentication operations
- **Token Management** - Storing and using JWTs in secure HTTP-only cookies

### 3. Authentication Flow

#### Registration Flow

1. User submits registration form on frontend
2. Frontend sends registration data to backend `/auth/sign-up` endpoint
3. Backend validates data and creates user account
4. Backend returns success response
5. Frontend redirects user to login page

#### Login Flow

1. User submits login form on frontend
2. Frontend sends credentials to backend `/auth/sign-in` endpoint
3. Backend validates credentials and generates JWT token
4. Backend returns JWT token and user data
5. Frontend stores token in HTTP-only cookie using NextAuth
6. Frontend redirects user to dashboard

#### OAuth Flow (Google)

1. User clicks "Sign in with Google" button
2. NextAuth initiates OAuth flow with Google
3. Google returns OAuth token after successful authentication
4. Frontend sends OAuth token to backend `/auth/google` endpoint
5. Backend validates OAuth token and either creates or fetches user account
6. Backend returns JWT token and user data
7. Frontend stores token in HTTP-only cookie using NextAuth
8. Frontend redirects user to dashboard

## Security Considerations

### Token Security

- JWT tokens are stored in HTTP-only cookies to prevent XSS attacks
- JWT tokens are signed using a strong secret key
- Tokens have a reasonable expiration time (30 days)

### API Security

- All authentication endpoints are protected against CSRF attacks
- Rate limiting is implemented to prevent brute force attacks
- Input validation is performed on all endpoints

### Data Security

- Passwords are hashed using bcrypt with appropriate work factor
- Sensitive data is not logged or exposed in responses
- OAuth tokens are never stored in the database

## Middleware

The authentication middleware provides several layers of protection:

1. **authenticate** - Verifies JWT token and attaches user data to request
2. **isAdmin** - Restricts endpoints to admin users only
3. **isInstructor** - Restricts endpoints to instructor users only
4. **checkSubscription** - Verifies user subscription status

## Scaling Considerations

### Horizontal Scaling

- Authentication services are stateless and can be scaled horizontally
- JWT validation doesn't require database access for every request

### Database Scaling

- User authentication data is stored in a scalable database
- Read-heavy operations are optimized with indexes

## Future Improvements

1. **Refresh Token Strategy** - Implement refresh tokens for better security
2. **MFA Support** - Add multi-factor authentication for enhanced security
3. **Session Management** - Implement server-side session tracking for critical operations
4. **OAuth Enhancements** - Add more OAuth providers (Apple, Facebook, etc.)

## Conclusion

This authentication architecture separates concerns between frontend and backend, allowing for better security, maintainability, and scalability. The backend handles the core authentication logic while the frontend provides a seamless user experience through the adapter pattern.
