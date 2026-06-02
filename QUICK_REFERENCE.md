---
# Norex Backend Architecture Quick Reference

## Current System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js/React)                    │
│                                                                 │
│  Component (Login Form)                                        │
│         ↓                                                       │
│  Redux Hook: useLoginUserMutation()                           │
│         ↓                                                       │
│  Redux Thunk (authApi.js)                                     │
│         ↓                                                       │
│  RTK Query Endpoint                                            │
│  POST /api/user/login                                         │
│         ↓                                                       │
│  apiSlice (prepareHeaders)                                    │
│  Adds: Authorization: Bearer {token}                         │
│         ↓                                                       │
│  Cookies.set('userInfo', { token, user })                    │
│         ↓                                                       │
│  Redux State: auth = { accessToken, user }                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓↑ (Network)
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                         │
│                                                                 │
│  Route: POST /api/user/login                                  │
│         ↓                                                       │
│  Middleware: Validation, rate limiting                        │
│         ↓                                                       │
│  Controller: Validate email/password                          │
│         ↓                                                       │
│  Database Query: Find user in MongoDB                        │
│         ↓                                                       │
│  JWT Generation: Create token with user data                 │
│         ↓                                                       │
│  Response: { data: { token, user } }                        │
└─────────────────────────────────────────────────────────────────┘
```

## Firebase Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   FIREBASE AUTHENTICATION                       │
│                                                                 │
│  loginUser({ email, password })                              │
│         ↓                                                       │
│  Firebase Auth SDK                                            │
│  signInWithEmailAndPassword()                                 │
│         ↓                                                       │
│  Firebase Returns: User + ID Token                           │
│         ↓                                                       │
│  Store: Redux State + Cookies                                │
│         ↓                                                       │
│  Get Token: getUserToken()                                   │
│  Used for: Backend API requests                             │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── redux/
│   ├── api/
│   │   └── apiSlice.js              (RTK Query base config)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authApi.js           (Backend auth endpoints)
│   │   │   ├── authSlice.js         (Redux auth state)
│   │   │   ├── firebaseAuthSlice.js (Firebase auth state)
│   │   │   └── firebaseAuthApi.js   (Firebase async thunks)
│   │   ├── categoryApi.js           (Products API)
│   │   ├── productApi.js            (Products API)
│   │   └── ... (other APIs)
│   └── store.js                     (Redux store config)
├── firebase/
│   ├── firebaseConfig.js            (Firebase initialization)
│   └── firebaseAuth.js              (Firebase auth functions)
├── middleware/
│   └── firebaseAuthListener.js      (Auth state sync)
└── components/
    └── forms/
        ├── login-form.jsx           (Uses auth hooks)
        └── register-form.jsx        (Uses auth hooks)
```

## Key Concepts

**Redux Toolkit**: State management for app data
**RTK Query**: Automatic API caching and fetching
**Firebase Auth**: User authentication service
**Cookies**: Persist user data across sessions
**JWT Tokens**: Secure user identification

## API Endpoints (Current Backend)

```
POST   /api/user/signup              Register new user
POST   /api/user/login               Login user
GET    /api/user/me                  Get current user
POST   /api/user/confirm-email       Verify email
PATCH  /api/user/change-password     Change password
PUT    /api/user/update-user/:id     Update profile

GET    /api/category/show            Get all categories
GET    /api/category/show/fashion    Get fashion categories

GET    /api/product                  Get all products
GET    /api/product/:id              Get single product
POST   /api/product                  Create product (admin)
```

## Environment Variables Needed

For Backend Integration:
```
NEXT_PUBLIC_API_BASE_URL=https://shofy-backend.vercel.app
```

For Firebase Integration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

---
