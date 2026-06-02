---
# Norex Fashion School - Backend Architecture & Firebase Auth Guide

## Current Backend Architecture

### Overview
The project uses:
- **Frontend Framework**: Next.js (React)
- **State Management**: Redux Toolkit + RTK Query
- **API Communication**: RTK Query (built on Fetch API)
- **Authentication**: JWT-based tokens stored in cookies
- **Current Backend**: https://shofy-backend.vercel.app (Express.js)
- **Database**: MongoDB (used by the backend)

---

## How the Current System Works

### 1. **API Communication Flow**

```
Frontend Component
    ↓
Redux Hook (e.g., useLoginUserMutation)
    ↓
RTK Query Endpoint
    ↓
apiSlice (baseQuery with fetch)
    ↓
Backend API (https://shofy-backend.vercel.app)
    ↓
MongoDB Database
    ↓
Response with data + JWT token
    ↓
Stored in Redux state + Cookies
```

### 2. **API Configuration** (`src/redux/api/apiSlice.js`)

The `apiSlice` is the central API configuration:
```javascript
- baseUrl: https://shofy-backend.vercel.app
- Automatically adds JWT token to Authorization header
- Token is read from cookies
- All requests use this configuration
```

### 3. **RTK Query Endpoints Structure**

Each API feature (auth, products, categories) extends `apiSlice`:
```javascript
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({...}),
    registerUser: builder.mutation({...}),
    ...
  })
})
```

### 4. **Current Authentication Flow**

**Login:**
1. User submits email/password via login form
2. `useLoginUserMutation` sends POST to `/api/user/login`
3. Backend returns: `{ token, user }`
4. Token + user stored in Redux state
5. Token saved in cookies for persistence
6. Subsequent requests include `Authorization: Bearer {token}`

**State Management:**
- Redux `authSlice` stores: `{ accessToken, user }`
- Cookies backup: Persists data across page refreshes
- API automatically injects token in headers

---

## How to Integrate Firebase Authentication

### Step 1: Install Firebase SDK

```bash
npm install firebase
```

### Step 2: Create Firebase Configuration

Create `src/firebase/firebaseConfig.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Step 3: Create `.env.local` with Firebase Credentials

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 4: Create Firebase Auth Slice

Create `src/redux/features/auth/firebaseAuthSlice.js`:

```javascript
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const firebaseAuthSlice = createSlice({
  name: "firebaseAuth",
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      Cookies.remove('firebaseUser');
    },
  },
});

export const { setUser, setLoading, setError, logout } = firebaseAuthSlice.actions;
export default firebaseAuthSlice.reducer;
```

### Step 5: Create Firebase Auth API Service

Create `src/firebase/firebaseAuth.js`:

```javascript
import { auth, db } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Register new user
export const registerWithFirebase = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Save user to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Login with email and password
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Save to Firestore if new user
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Get user ID token for backend communication
export const getUserToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Listen to auth state
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};
```

### Step 6: Create Redux Async Thunks for Firebase

Create `src/redux/features/auth/firebaseAuthApi.js`:

```javascript
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as firebaseAuth from '@/firebase/firebaseAuth';
import Cookies from 'js-cookie';

export const registerUser = createAsyncThunk(
  'firebaseAuth/registerUser',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      const user = await firebaseAuth.registerWithFirebase(email, password, displayName);
      const token = await firebaseAuth.getUserToken();

      // Store token in cookies
      Cookies.set('firebaseToken', token, { expires: 7 });

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        token,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'firebaseAuth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const user = await firebaseAuth.loginWithFirebase(email, password);
      const token = await firebaseAuth.getUserToken();

      // Store token in cookies
      Cookies.set('firebaseToken', token, { expires: 7 });

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        token,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const googleSignIn = createAsyncThunk(
  'firebaseAuth/googleSignIn',
  async (_, { rejectWithValue }) => {
    try {
      const user = await firebaseAuth.signInWithGoogle();
      const token = await firebaseAuth.getUserToken();

      Cookies.set('firebaseToken', token, { expires: 7 });

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        token,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  'firebaseAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseAuth.logoutUser();
      Cookies.remove('firebaseToken');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Step 7: Update Redux Store

Update `src/redux/store.js`:

```javascript
import firebaseAuthSlice from "./features/auth/firebaseAuthSlice";

const store = configureStore({
  reducer: {
    // ... existing reducers
    firebaseAuth: firebaseAuthSlice,
  },
  // ... existing middleware
});
```

### Step 8: Add Auth State Listener Middleware

Create `src/middleware/firebaseAuthListener.js`:

```javascript
import { onAuthStateChangedListener, getUserToken } from '@/firebase/firebaseAuth';
import { setUser, logout } from '@/redux/features/auth/firebaseAuthSlice';

export const setupAuthListener = (dispatch) => {
  onAuthStateChangedListener(async (user) => {
    if (user) {
      const token = await getUserToken();
      dispatch(
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          token,
        })
      );
    } else {
      dispatch(logout());
    }
  });
};
```

### Step 9: Use in Login Component

Update `src/components/forms/login-form.jsx`:

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, googleSignIn } from '@/redux/features/auth/firebaseAuthApi';

const LoginForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.firebaseAuth);

  const handleLogin = async (email, password) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Redirect to dashboard
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(googleSignIn()).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // Form JSX
  );
};
```

---

## Database Structure Options

### Option 1: Firebase Firestore Only
- User data
- Orders
- Products (admin)
- Reviews

### Option 2: Firestore + Backend Database
- Firebase: User profiles, auth
- Backend DB: Products, orders, transactions
- Sync data between them

### Option 3: Keep Backend - Use Firebase for Auth Only
- Keep Express backend for products/orders
- Use Firebase only for authentication
- Update apiSlice to use Firebase tokens

---

## Migration Path

**Current → Firebase (Gradual)**

1. Set up Firebase configuration
2. Create parallel auth system
3. Redirect new users to Firebase
4. Migrate existing users gradually
5. Deprecate old auth endpoints
6. Update backend to verify Firebase tokens

---

## Security Considerations

✅ Firebase security rules
✅ Backend token validation
✅ CORS configuration
✅ Environment variables (.env.local)
✅ Rate limiting
✅ Input validation

---

## Next Steps for Your Project

1. Create Firebase project at https://console.firebase.google.com
2. Get your config credentials
3. Add to .env.local
4. Implement the auth system above
5. Test registration & login
6. Connect to products & orders

