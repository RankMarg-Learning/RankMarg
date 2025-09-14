# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for both development and production environments.

## Prerequisites

1. Google Cloud Console account
2. A Google Cloud project

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Choose **Web application** as the application type

## Step 2: Configure Authorized URIs

### For Development:

- **Authorized JavaScript origins**: `http://localhost:3000`
- **Authorized redirect URIs**: `http://localhost:3001/api/auth/google/callback`

### For Production:

- **Authorized JavaScript origins**:
  - `https://rankmarg.in`
  - `https://www.rankmarg.in`
- **Authorized redirect URIs**: `https://api.rankmarg.in/api/auth/google/callback`

## Step 3: Environment Variables

### Development (.env)

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Frontend
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

### Production (.env)

```bash
# Environment
NODE_ENV=production

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="https://api.rankmarg.in/api/auth/google/callback"

# CORS
CORS_ORIGIN="https://rankmarg.in"

# Domains
BACKEND_DOMAIN="api.rankmarg.in"
FRONTEND_DOMAIN="rankmarg.in"
COOKIE_DOMAIN=".rankmarg.in"

# Frontend (for Next.js)
NEXT_PUBLIC_BACKEND_URL="https://api.rankmarg.in"
```

## Step 4: Frontend Configuration

The frontend should have a `.env.local` file with:

```bash
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"  # for development
NEXT_PUBLIC_BACKEND_URL="https://api.rankmarg.in"  # for production
```

## OAuth Flow

1. User clicks "Login with Google" button
2. Frontend redirects to: `{BACKEND_URL}/api/auth/google`
3. Backend redirects to Google OAuth
4. User authenticates with Google
5. Google redirects back to: `{BACKEND_URL}/api/auth/google/callback`
6. Backend processes the authentication
7. Backend sets HTTP-only cookie with JWT token
8. Backend redirects user to frontend dashboard or onboarding

## Testing OAuth

### Development

1. Ensure your backend is running on `http://localhost:3001`
2. Ensure your frontend is running on `http://localhost:3000`
3. Click the Google login button
4. You should be redirected to Google for authentication

### Production

1. Deploy backend to `https://api.rankmarg.in`
2. Deploy frontend to `https://rankmarg.in`
3. Update Google OAuth credentials with production URLs
4. Test the OAuth flow

## Troubleshooting

### Common Issues:

1. **Error: redirect_uri_mismatch**

   - Check that the redirect URI in Google Console matches exactly
   - Ensure no trailing slashes or mismatched protocols (http vs https)

2. **CORS Errors**

   - Verify `CORS_ORIGIN` environment variable
   - Check that frontend and backend URLs match your configuration

3. **Cookie Issues in Production**

   - Ensure `COOKIE_DOMAIN` is set correctly
   - Verify your domains are configured properly
   - Check that cookies are marked as secure in production

4. **Authentication Token Not Set**
   - Check that JWT_SECRET is properly configured
   - Verify the auth token cookie is being set in the response

### Debug Steps:

1. Check browser network tab for failed requests
2. Verify environment variables are loaded correctly
3. Check backend logs for authentication errors
4. Ensure Google OAuth credentials are active and properly configured

## Security Considerations

1. Always use HTTPS in production
2. Set secure cookie flags in production
3. Use proper CORS configuration
4. Keep Google OAuth credentials secure
5. Regularly rotate JWT secrets
6. Monitor for suspicious authentication attempts
