# Testing Cookie-based Authentication with Postman

## Setup for Postman

1. **Enable cookie management in Postman**:
   - Go to Settings > General
   - Make sure "Automatically follow redirects" is ON
   - Enable "Save cookies" option

## Test Flows

### 1. User Registration

**Request:**

- Method: `POST`
- URL: `http://localhost:3001/api/auth/sign-up`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "fullname": "Test User",
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123"
}
```

**Expected Response:** 201 Created

### 2. User Login

**Request:**

- Method: `POST`
- URL: `http://localhost:3001/api/auth/sign-in`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "username": "testuser",
  "password": "Password123"
}
```

**Expected Response:**

- Status: 200 OK
- Headers will include: `Set-Cookie: auth_token=xxxx; HttpOnly; Path=/;`
- Body will contain user information and accessToken

### 3. Access Protected Route

**Request:**

- Method: `GET`
- URL: `http://localhost:3001/api/auth/profile`
- Cookies: The auth_token cookie will be automatically sent by Postman

**Expected Response:**

- Status: 200 OK
- Body will contain user profile information

### 4. Sign Out

**Request:**

- Method: `POST`
- URL: `http://localhost:3001/api/auth/sign-out`
- Cookies: The auth_token cookie will be sent

**Expected Response:**

- Status: 200 OK
- Headers will include: `Set-Cookie` header clearing the auth_token cookie
- Body will include success message

### 5. Verify Cookie Authentication

After signing out, try to access a protected route:

**Request:**

- Method: `GET`
- URL: `http://localhost:3001/api/auth/profile`

**Expected Response:**

- Status: 401 Unauthorized

## Testing Google OAuth

1. Create a new request in Postman to: `http://localhost:3001/api/auth/google`
2. Send the request from your browser, not Postman
3. Complete Google authentication in the browser
4. When redirected back to your application, the auth_token cookie will be set
5. You can then use Postman to access protected routes with this cookie

## Notes on Cookie Security

The implementation uses secure cookies with these properties:

- `HttpOnly`: Prevents JavaScript from accessing the cookie
- `Secure` (in production): Ensures the cookie is only sent over HTTPS
- `SameSite: lax`: Protects against CSRF attacks
- `Path: /`: Cookie is available throughout the application

This configuration offers strong protection against common attacks:

- XSS attacks cannot access the cookie due to HttpOnly
- MITM attacks are prevented by Secure flag
- CSRF protection via SameSite attribute
