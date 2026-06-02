---
# Norex Fashion - Current Backend & MongoDB Architecture

## System Overview

This is a **Next.js Frontend** that connects to a **separate Express.js Backend** running on Vercel.

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (This Project - Next.js on Vercel/Local)          │
│                                                             │
│ • React Components                                          │
│ • Redux State Management                                    │
│ • RTK Query (API calls)                                     │
│ • Stripe Integration                                        │
│ • User Interface                                            │
└─────────────────────────────────────────────────────────────┘
                    ↓ ↑ (HTTP REST API)
                 Network Requests
                    ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Separate Express.js App)                           │
│ URL: https://shofy-backend.vercel.app                      │
│                                                             │
│ • Express.js Routes & Controllers                           │
│ • MongoDB Database Connection                               │
│ • Authentication & Validation                               │
│ • Payment Processing                                        │
│ • Business Logic                                            │
└─────────────────────────────────────────────────────────────┘
                    ↓ ↑
        Database Connection (Mongoose ODM)
                    ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (MongoDB Atlas - Cloud)                            │
│                                                             │
│ Collections:                                                │
│ • users (authentication, profiles)                          │
│ • products (fashion designs)                                │
│ • categories (fashion categories)                           │
│ • orders (customer purchases)                               │
│ • reviews (product ratings)                                 │
│ • coupons (discount codes)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend → Backend Communication

### How RTK Query Works

The frontend uses **RTK Query** to automatically manage API calls, caching, and state.

**Example: Fetching Products**

```javascript
// Step 1: Component imports the hook
import { useGetAllProductsQuery } from '@/redux/features/productApi';

// Step 2: Component uses the hook
function ProductList() {
  const { data: products, isLoading, isError } = useGetAllProductsQuery();
  
  return (
    <>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading products</p>}
      {products && products.map(p => <ProductCard key={p._id} product={p} />)}
    </>
  );
}

// Step 3: Behind the scenes...
// RTK Query:
// 1. Checks if data is cached
// 2. If not cached, makes GET request to backend
// 3. Stores result in Redux state
// 4. Caches it for future use (prevents redundant requests)
// 5. Provides data to component
```

### RTK Query Query vs Mutation

**Query** (Get data - automatic caching):
```javascript
getAllProducts: builder.query({
  query: () => `https://shofy-backend.vercel.app/api/product/all`,
  providesTags: ['Products']  // For cache invalidation
})
// Usage: const { data } = useGetAllProductsQuery();
```

**Mutation** (Create/Update/Delete - manual):
```javascript
saveOrder: builder.mutation({
  query: (data) => ({
    url: "https://shofy-backend.vercel.app/api/order/saveOrder",
    method: "POST",
    body: data,
  }),
  invalidatesTags: ['UserOrders']  // Refresh cache after mutation
})
// Usage: const [saveOrder] = useSaveOrderMutation();
```

---

## Current Backend API Endpoints

### Product Endpoints
```
GET  /api/product/all                      Get all products
GET  /api/product/{type}?{query}           Get products by type (fashion, etc)
GET  /api/product/offer?type={type}        Get offer/sale products
GET  /api/product/popular/{type}           Get popular products by type
GET  /api/product/top-rated                Get top-rated products
GET  /api/product/single-product/{id}      Get single product details
GET  /api/product/related-product/{id}     Get related products
POST /api/product                          Create product (admin only)
PUT  /api/product/{id}                     Update product (admin only)
DELETE /api/product/{id}                   Delete product (admin only)
```

### Category Endpoints
```
GET  /api/category/show                    Get all categories
GET  /api/category/show/{type}             Get categories by type (fashion)
POST /api/category/add                     Create category (admin only)
```

### User/Auth Endpoints
```
POST /api/user/signup                      Register new user
POST /api/user/login                       Login user
GET  /api/user/me                          Get current user profile
PATCH /api/user/change-password            Change password
PUT  /api/user/update-user/{id}            Update profile
PATCH /api/user/forget-password            Request password reset
PATCH /api/user/confirm-forget-password    Confirm password reset
GET  /api/user/confirmEmail/{token}        Verify email address
```

### Order Endpoints
```
POST /api/order/create-payment-intent      Create Stripe payment (Stripe integration)
POST /api/order/saveOrder                  Save order to database
GET  /api/user-order                       Get user's orders
GET  /api/user-order/{id}                  Get single order details
```

### Review Endpoints
```
GET  /api/review/{productId}               Get product reviews
POST /api/review                           Create review
PUT  /api/review/{id}                      Update review
DELETE /api/review/{id}                    Delete review
```

---

## MongoDB Database Structure

MongoDB stores data in **JSON-like documents** organized in **Collections** (similar to tables).

### Product Collection
```javascript
{
  _id: ObjectId("123abc..."),
  title: "Ankara Dress",
  description: "Beautiful traditional Ankara fabric dress",
  category: "fashion",
  subcategory: "women-dresses",
  price: 45000,
  originalPrice: 60000,
  discount: 25,
  images: [
    { url: "https://...", alt: "Front view" },
    { url: "https://...", alt: "Side view" }
  ],
  sizes: ["S", "M", "L", "XL"],
  colors: ["Red", "Blue", "Green"],
  inStock: true,
  quantity: 50,
  rating: 4.5,
  reviewCount: 12,
  description: "...",
  specifications: {
    material: "100% Cotton",
    care: "Hand wash",
    origin: "Nigeria"
  },
  createdAt: ISODate("2024-06-02T..."),
  updatedAt: ISODate("2024-06-02T...")
}
```

### User Collection
```javascript
{
  _id: ObjectId("456def..."),
  email: "user@example.com",
  password: "$2b$10$hashedPassword...",  // Encrypted
  displayName: "John Doe",
  phone: "+234 800 000 0000",
  profileImage: "https://...",
  address: {
    street: "123 Lekki Road",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    zipCode: "100001"
  },
  preferences: {
    newsletter: true,
    notifications: true
  },
  emailVerified: true,
  createdAt: ISODate("2024-01-15T..."),
  updatedAt: ISODate("2024-06-02T...")
}
```

### Order Collection
```javascript
{
  _id: ObjectId("789ghi..."),
  userId: ObjectId("456def..."),  // Reference to User
  orderNumber: "ORD-2024-0001",
  items: [
    {
      productId: ObjectId("123abc..."),  // Reference to Product
      quantity: 2,
      price: 45000,
      size: "M",
      color: "Red"
    }
  ],
  totalAmount: 95000,
  discount: 5000,
  finalAmount: 90000,
  shippingAddress: {
    fullName: "John Doe",
    address: "123 Lekki Road, Lagos",
    phone: "+234 800 000 0000"
  },
  paymentMethod: "stripe",
  paymentStatus: "completed",
  stripePaymentId: "pi_1234567890",
  orderStatus: "delivered",
  statusHistory: [
    { status: "pending", date: ISODate("..."), note: "Order received" },
    { status: "processing", date: ISODate("..."), note: "Processing" },
    { status: "shipped", date: ISODate("..."), note: "Shipped" },
    { status: "delivered", date: ISODate("..."), note: "Delivered" }
  ],
  trackingNumber: "NG123456789",
  createdAt: ISODate("2024-06-01T..."),
  deliveredAt: ISODate("2024-06-05T...")
}
```

### Review Collection
```javascript
{
  _id: ObjectId("xyz123..."),
  productId: ObjectId("123abc..."),  // Reference to Product
  userId: ObjectId("456def..."),     // Reference to User
  rating: 5,
  title: "Excellent quality!",
  comment: "The dress is beautiful and fits perfectly",
  verified: true,
  helpful: 12,
  unhelpful: 1,
  createdAt: ISODate("2024-06-02T...")
}
```

### Category Collection
```javascript
{
  _id: ObjectId("cat001..."),
  parent: "Fashion",
  name: "Women Dresses",
  slug: "women-dresses",
  img: "https://...",
  type: "fashion",
  description: "Beautiful women's dresses collection",
  icon: "👗",
  productCount: 45,
  createdAt: ISODate("2024-01-01T...")
}
```

---

## How Data Flows: Example - Buying a Product

```
1. User clicks "Add to Cart"
   ↓
2. Redux cart state updated locally (instant)
   ↓
3. User clicks "Checkout"
   ↓
4. Component calls: useCreatePaymentIntentMutation()
   ↓
5. Frontend sends POST request:
   URL: /api/order/create-payment-intent
   Data: { items: [...], total: 90000 }
   Header: Authorization: Bearer {JWT token}
   ↓
6. Backend receives request:
   - Verifies JWT token
   - Validates user exists
   - Calculates final total
   - Creates Stripe payment intent
   - Returns: { clientSecret: "pi_123..." }
   ↓
7. Frontend receives response
   - Stores clientSecret in Redux
   - Displays Stripe payment form
   ↓
8. User enters card details and submits
   ↓
9. Frontend sends to Stripe
   - Stripe processes payment
   - Stripe confirms payment to backend
   ↓
10. User clicks "Confirm Payment"
    ↓
11. Component calls: useSaveOrderMutation()
    ↓
12. Frontend sends POST request:
    URL: /api/order/saveOrder
    Data: { items, total, shippingAddress, stripePaymentId }
    ↓
13. Backend receives request:
    - Verifies payment in Stripe
    - Saves order to MongoDB
    - Updates product stock
    - Clears Redis/cache
    - Sends confirmation email
    ↓
14. Response: { orderId: "ORD-2024-0001" }
    ↓
15. Frontend:
    - Clears localStorage cart
    - Shows success message
    - Redirects to order confirmation
```

---

## Current Data Flow Summary

### Frontend Cache Strategy (RTK Query)

```
Component Request
   ↓
RTK Query checks cache?
   ├─ If cached: Return cached data (instant)
   └─ If not cached: Make HTTP request
        ↓
    apiSlice prepares request:
        - Add Authorization header (JWT token from cookies)
        - Set Content-Type
        ↓
    Send to Backend via Fetch
        ↓
    Backend processes:
        - Verify token
        - Query MongoDB
        - Return JSON response
        ↓
    RTK Query receives response:
        - Cache data in Redux
        - Invalidate related cache tags
        - Return data to component
        ↓
    Component re-renders with new data
```

### State Management Layers

```
Browser Session:
├─ Redux State (in-memory)
│  └─ auth, products, cart, orders, etc.
├─ Cookies
│  └─ userInfo: { token, user }
└─ LocalStorage
   └─ cart_products, shipping_info, couponInfo

Backend Session:
├─ MongoDB Collections
│  └─ Persistent data
└─ Stripe
   └─ Payment records
```

---

## Important Files

**Frontend API Configuration:**
- `src/redux/api/apiSlice.js` - Central API config
- `src/redux/features/productApi.js` - Product endpoints
- `src/redux/features/auth/authApi.js` - Auth endpoints
- `src/redux/features/order/orderApi.js` - Order endpoints

**Frontend State:**
- `src/redux/features/auth/authSlice.js` - Auth state
- `src/redux/features/cartSlice.js` - Cart state
- `src/redux/store.js` - Redux store

---

## Key Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js + React | UI & interaction |
| State | Redux Toolkit | App state |
| API | RTK Query | API calls & caching |
| Backend | Express.js | Server & routes |
| Database | MongoDB | Data persistence |
| Auth | JWT + Cookies | User authentication |
| Payment | Stripe | Payment processing |
| Deployment | Vercel | Hosting (frontend & backend) |

---

## How to View/Modify Backend

The backend code is **in a separate repository**:
- Current Backend: https://shofy-backend.vercel.app
- This is NOT included in this project
- To modify backend, you need access to that repo

**If you want to:**
1. **Change API endpoints** → Modify Redux files (productApi.js, etc)
2. **Change data structure** → Modify backend MongoDB schema (separate repo)
3. **Add new features** → Coordinate frontend + backend changes

---

## Next Steps for Norex Fashion

1. **Access Backend Repository** - Get backend code from original developer
2. **Deploy Your Own Backend** - Fork/clone backend, customize for Norex
3. **Connect to Custom MongoDB** - Create MongoDB Atlas account, change connection string
4. **Update API Endpoints** - Change URLs from `shofy-backend.vercel.app` to your backend
5. **Add Norex Products** - Upload fashion designs to your MongoDB
6. **Test Integration** - Verify frontend → backend → MongoDB communication

