# Authentication Testing Guide

This guide provides comprehensive testing procedures for the HeyTrack UMKM authentication system.

## Prerequisites

1. Ensure the development server is running: `npm run dev`
2. Have at least two test user accounts ready:
   - Test User 1: `test1@example.com` / `password123`
   - Test User 2: `test2@example.com` / `password123`
3. Access to Supabase dashboard for verification
4. Browser DevTools open (Network and Console tabs)

---

## 7.1 Authentication Flows Testing

### Test 1.1: Login with Valid Credentials

**Steps:**
1. Navigate to `http://localhost:3000/auth/login`
2. Enter valid email: `test1@example.com`
3. Enter valid password: `password123`
4. Click "Masuk" button

**Expected Results:**
- ✅ No console errors
- ✅ Redirect to `/dashboard`
- ✅ User info displayed in dashboard
- ✅ Session cookie set in browser
- ✅ Network request shows 200 status

**Verification:**
```javascript
// Check in browser console
const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session) // Should show valid session
```

---

### Test 1.2: Login with Invalid Credentials

**Steps:**
1. Navigate to `http://localhost:3000/auth/login`
2. Enter email: `test1@example.com`
3. Enter wrong password: `wrongpassword`
4. Click "Masuk" button

**Expected Results:**
- ✅ Error message displayed: "Email atau password salah"
- ✅ User remains on login page
- ✅ No redirect occurs
- ✅ No session created
- ✅ Form fields remain populated (email only)

---

### Test 1.3: Registration Flow

**Steps:**
1. Navigate to `http://localhost:3000/auth/register`
2. Enter new email: `newuser@example.com`
3. Enter password: `securepass123`
4. Enter full name: `Test User`
5. Click "Daftar" button

**Expected Results:**
- ✅ Success message displayed
- ✅ Email confirmation message shown
- ✅ User redirected to login or confirmation page
- ✅ Confirmation email sent (check email inbox)
- ✅ User record created in Supabase auth.users

**Verification in Supabase:**
- Check Authentication > Users
- Verify new user exists
- Check email_confirmed_at is null (until confirmed)

---

### Test 1.4: Password Reset Flow

**Steps:**
1. Navigate to `http://localhost:3000/auth/reset-password`
2. Enter email: `test1@example.com`
3. Click "Kirim Link Reset" button
4. Check email inbox for reset link
5. Click reset link in email
6. Enter new password
7. Submit new password

**Expected Results:**
- ✅ Success message: "Link reset password telah dikirim"
- ✅ Reset email received
- ✅ Reset link redirects to update password page
- ✅ New password accepted
- ✅ Can login with new password
- ✅ Cannot login with old password

---

### Test 1.5: Session Persistence Across Page Refreshes

**Steps:**
1. Login with valid credentials
2. Navigate to `/dashboard`
3. Refresh the page (F5 or Cmd+R)
4. Navigate to `/orders`
5. Refresh again
6. Navigate to `/ingredients`
7. Refresh again

**Expected Results:**
- ✅ User remains logged in after each refresh
- ✅ No redirect to login page
- ✅ User data persists
- ✅ No console errors
- ✅ Session token remains valid

**Verification:**
```javascript
// Check session after each refresh
const { data: { session } } = await supabase.auth.getSession()
console.log('Session valid:', !!session)
console.log('User ID:', session?.user?.id)
```

---

### Test 1.6: Sign Out Functionality

**Steps:**
1. Login with valid credentials
2. Navigate to `/dashboard`
3. Click user menu/profile
4. Click "Keluar" or sign out button
5. Verify redirect to login page

**Expected Results:**
- ✅ User redirected to `/auth/login`
- ✅ Session cleared from browser
- ✅ Cannot access protected routes
- ✅ Attempting to access `/dashboard` redirects to login
- ✅ No console errors

**Verification:**
```javascript
// Check session after sign out
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session) // Should be null
```

---

## 7.2 Protected Routes Testing

### Test 2.1: Access Protected Routes Without Auth

**Protected Routes to Test:**
- `/dashboard`
- `/orders`
- `/ingredients`
- `/resep` (recipes)
- `/hpp`
- `/customers`
- `/cash-flow`
- `/profit`
- `/operational-costs`
- `/reports`
- `/settings`

**Steps:**
1. Ensure you're logged out (clear cookies if needed)
2. Navigate directly to each protected route

**Expected Results:**
- ✅ Immediate redirect to `/auth/login`
- ✅ URL includes `redirectTo` parameter: `/auth/login?redirectTo=/dashboard`
- ✅ No flash of protected content
- ✅ No console errors
- ✅ After login, redirect back to intended page

---

### Test 2.2: Access Protected Routes With Auth

**Steps:**
1. Login with valid credentials
2. Navigate to each protected route listed above
3. Verify content loads correctly

**Expected Results:**
- ✅ All routes accessible
- ✅ Content loads without errors
- ✅ User-specific data displayed
- ✅ No redirects
- ✅ Navigation works smoothly

---

### Test 2.3: Access Login Page With Auth

**Steps:**
1. Login with valid credentials
2. Navigate to `/auth/login`
3. Try to access `/auth/register`

**Expected Results:**
- ✅ Redirect to `/dashboard` from login page
- ✅ Redirect to `/dashboard` from register page
- ✅ No access to auth pages while authenticated
- ✅ Smooth redirect without flash

---

### Test 2.4: Root Path Redirects Based on Auth State

**Test A: Unauthenticated User**
1. Ensure logged out
2. Navigate to `http://localhost:3000/`

**Expected:**
- ✅ Redirect to `/auth/login`

**Test B: Authenticated User**
1. Login with valid credentials
2. Navigate to `http://localhost:3000/`

**Expected:**
- ✅ Redirect to `/dashboard`

---

## 7.3 API Endpoints Testing

### Test 3.1: API Calls Without Auth

**Steps:**
1. Ensure logged out
2. Open browser DevTools > Console
3. Run the following tests:

```javascript
// Test Orders API
fetch('/api/orders')
  .then(r => r.json())
  .then(console.log)
// Expected: { error: "Unauthorized" } with 401 status

// Test Ingredients API
fetch('/api/ingredients')
  .then(r => r.json())
  .then(console.log)
// Expected: { error: "Unauthorized" } with 401 status

// Test Recipes API
fetch('/api/recipes')
  .then(r => r.json())
  .then(console.log)
// Expected: { error: "Unauthorized" } with 401 status

// Test Customers API
fetch('/api/customers')
  .then(r => r.json())
  .then(console.log)
// Expected: { error: "Unauthorized" } with 401 status
```

**Expected Results:**
- ✅ All requests return 401 status
- ✅ Error message: "Unauthorized"
- ✅ No data returned
- ✅ No database queries executed

---

### Test 3.2: API Calls With Valid Auth

**Steps:**
1. Login with valid credentials
2. Open browser DevTools > Console
3. Run the following tests:

```javascript
// Test Orders API
fetch('/api/orders')
  .then(r => r.json())
  .then(data => {
    console.log('Orders:', data)
    console.log('Count:', data.length)
  })
// Expected: Array of user's orders

// Test Ingredients API
fetch('/api/ingredients')
  .then(r => r.json())
  .then(data => {
    console.log('Ingredients:', data)
    console.log('Count:', data.length)
  })
// Expected: Array of user's ingredients

// Test POST - Create Order
fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_name: 'Test Customer',
    total_amount: 100000,
    status: 'pending'
  })
})
  .then(r => r.json())
  .then(console.log)
// Expected: Created order with user_id set
```

**Expected Results:**
- ✅ All requests return 200 status
- ✅ Data returned successfully
- ✅ Only user's own data visible
- ✅ POST requests create records with user_id

---

### Test 3.3: Verify RLS Policies Filter Data Correctly

**Setup:**
1. Create test data for User 1
2. Create test data for User 2
3. Login as User 1

**Steps:**
1. Login as `test1@example.com`
2. Create an order via UI or API
3. Note the order ID
4. Logout
5. Login as `test2@example.com`
6. Try to access User 1's order

**Expected Results:**
- ✅ User 1 can see their own orders
- ✅ User 2 cannot see User 1's orders
- ✅ API returns only user-specific data
- ✅ Direct database queries filtered by RLS
- ✅ No cross-user data leakage

**Verification in Supabase:**
```sql
-- Run in Supabase SQL Editor
SELECT id, customer_name, user_id 
FROM orders 
WHERE id = 'order-id-from-user-1';

-- Should show user_id matches User 1's auth.uid()
```

---

## 7.4 Feature Integration Testing

### Test 4.1: Orders with user_id

**Steps:**
1. Login as `test1@example.com`
2. Navigate to `/orders`
3. Click "Tambah Pesanan" (Add Order)
4. Fill in order details:
   - Customer: "Test Customer"
   - Items: Add at least one item
   - Total: 100000
5. Submit the form
6. Verify order appears in list

**Expected Results:**
- ✅ Order created successfully
- ✅ Order appears in orders list
- ✅ Order has user_id set to current user
- ✅ No errors in console

**Verification:**
```javascript
// Check in browser console
fetch('/api/orders')
  .then(r => r.json())
  .then(orders => {
    const lastOrder = orders[0]
    console.log('Order user_id:', lastOrder.user_id)
    console.log('Current user:', session.user.id)
    console.log('Match:', lastOrder.user_id === session.user.id)
  })
```

---

### Test 4.2: Ingredients with user_id

**Steps:**
1. Login as `test1@example.com`
2. Navigate to `/ingredients`
3. Click "Tambah Bahan" (Add Ingredient)
4. Fill in ingredient details:
   - Name: "Test Ingredient"
   - Unit: "kg"
   - Stock: 10
   - Price: 50000
5. Submit the form

**Expected Results:**
- ✅ Ingredient created successfully
- ✅ Ingredient appears in list
- ✅ Ingredient has user_id set
- ✅ Only user's ingredients visible

---

### Test 4.3: Recipes with user_id

**Steps:**
1. Login as `test1@example.com`
2. Navigate to `/resep`
3. Create a new recipe
4. Add ingredients to recipe
5. Save recipe

**Expected Results:**
- ✅ Recipe created with user_id
- ✅ Recipe ingredients linked correctly
- ✅ Only user's recipes visible
- ✅ Recipe calculations work correctly

---

### Test 4.4: Multi-User Data Isolation

**Steps:**
1. Login as User 1
2. Create 3 orders, 3 ingredients, 2 recipes
3. Note the counts
4. Logout
5. Login as User 2
6. Check orders, ingredients, recipes

**Expected Results:**
- ✅ User 2 sees empty lists (or only their data)
- ✅ User 2 cannot see User 1's data
- ✅ User 1's data count unchanged when they log back in
- ✅ Complete data isolation between users

---

## 7.5 Mobile Responsiveness Testing

### Test 5.1: Auth Flows on Mobile

**Devices to Test:**
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad/Android)

**Steps:**
1. Open app on mobile device
2. Test login flow
3. Test registration flow
4. Test password reset

**Expected Results:**
- ✅ Forms display correctly
- ✅ Input fields accessible
- ✅ Buttons tap-able
- ✅ No layout issues
- ✅ Keyboard doesn't obscure inputs
- ✅ Success/error messages visible

---

### Test 5.2: Session Persistence on Mobile

**Steps:**
1. Login on mobile device
2. Navigate to different pages
3. Close browser (not just tab)
4. Reopen browser
5. Navigate to app

**Expected Results:**
- ✅ Session persists after browser close
- ✅ User remains logged in
- ✅ No re-authentication needed
- ✅ Data loads correctly

---

### Test 5.3: Touch Interactions

**Steps:**
1. Test all auth forms on touch device
2. Tap input fields
3. Use on-screen keyboard
4. Tap buttons
5. Test form validation

**Expected Results:**
- ✅ Touch targets large enough (min 44x44px)
- ✅ No accidental taps
- ✅ Smooth scrolling
- ✅ Keyboard appears/dismisses correctly
- ✅ Form submission works via touch

---

### Test 5.4: Responsive UI Display

**Breakpoints to Test:**
- Mobile: 320px - 480px
- Tablet: 481px - 768px
- Desktop: 769px+

**Steps:**
1. Resize browser or use device emulation
2. Test each breakpoint
3. Check all auth pages

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ No horizontal scrolling
- ✅ Text readable at all sizes
- ✅ Buttons accessible
- ✅ Forms usable on small screens

---

## Test Results Template

Use this template to record test results:

```markdown
## Test Execution: [Date]

### 7.1 Authentication Flows
- [ ] Test 1.1: Login with valid credentials - PASS/FAIL
- [ ] Test 1.2: Login with invalid credentials - PASS/FAIL
- [ ] Test 1.3: Registration flow - PASS/FAIL
- [ ] Test 1.4: Password reset flow - PASS/FAIL
- [ ] Test 1.5: Session persistence - PASS/FAIL
- [ ] Test 1.6: Sign out functionality - PASS/FAIL

### 7.2 Protected Routes
- [ ] Test 2.1: Access without auth - PASS/FAIL
- [ ] Test 2.2: Access with auth - PASS/FAIL
- [ ] Test 2.3: Auth pages with auth - PASS/FAIL
- [ ] Test 2.4: Root path redirects - PASS/FAIL

### 7.3 API Endpoints
- [ ] Test 3.1: API without auth - PASS/FAIL
- [ ] Test 3.2: API with auth - PASS/FAIL
- [ ] Test 3.3: RLS policies - PASS/FAIL

### 7.4 Feature Integration
- [ ] Test 4.1: Orders with user_id - PASS/FAIL
- [ ] Test 4.2: Ingredients with user_id - PASS/FAIL
- [ ] Test 4.3: Recipes with user_id - PASS/FAIL
- [ ] Test 4.4: Multi-user isolation - PASS/FAIL

### 7.5 Mobile Responsiveness
- [ ] Test 5.1: Auth flows on mobile - PASS/FAIL
- [ ] Test 5.2: Session persistence mobile - PASS/FAIL
- [ ] Test 5.3: Touch interactions - PASS/FAIL
- [ ] Test 5.4: Responsive UI - PASS/FAIL

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Additional observations]
```

---

## Automated Testing Script

For quick verification, run this script in browser console after logging in:

```javascript
async function runAuthTests() {
  console.log('🧪 Running Auth Tests...\n')
  
  // Test 1: Check session
  const { data: { session } } = await supabase.auth.getSession()
  console.log('✅ Session exists:', !!session)
  console.log('   User ID:', session?.user?.id)
  
  // Test 2: Check API auth
  const ordersRes = await fetch('/api/orders')
  console.log('✅ Orders API status:', ordersRes.status)
  
  const ingredientsRes = await fetch('/api/ingredients')
  console.log('✅ Ingredients API status:', ingredientsRes.status)
  
  // Test 3: Check RLS
  const orders = await ordersRes.json()
  const allHaveUserId = orders.every(o => o.user_id === session.user.id)
  console.log('✅ All orders have correct user_id:', allHaveUserId)
  
  console.log('\n✨ Tests complete!')
}

// Run tests
runAuthTests()
```
