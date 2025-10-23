# Quick Test Checklist

Use this checklist for rapid manual testing of the auth system.

## Setup
- [ ] Dev server running: `npm run dev`
- [ ] Browser DevTools open
- [ ] Test users created in Supabase

---

## 🔐 Auth Flows (5 min)

### Login
- [ ] Valid credentials → Dashboard ✅
- [ ] Invalid credentials → Error message ✅
- [ ] Session persists after refresh ✅

### Registration
- [ ] New user → Confirmation email ✅
- [ ] Duplicate email → Error ✅

### Sign Out
- [ ] Sign out → Redirect to login ✅
- [ ] Cannot access protected routes ✅

---

## 🔒 Protected Routes (3 min)

### Without Auth
- [ ] `/dashboard` → Redirect to login ✅
- [ ] `/orders` → Redirect to login ✅
- [ ] `/ingredients` → Redirect to login ✅

### With Auth
- [ ] All routes accessible ✅
- [ ] No redirects ✅

---

## 🔌 API Security (5 min)

### Browser Console Tests

```javascript
// Test 1: Without auth (logout first)
fetch('/api/orders').then(r => console.log('Status:', r.status))
// Expected: 401

// Test 2: With auth (login first)
fetch('/api/orders').then(r => r.json()).then(console.log)
// Expected: Array of orders

// Test 3: Verify user_id
fetch('/api/orders')
  .then(r => r.json())
  .then(orders => {
    console.log('All have user_id:', orders.every(o => o.user_id))
  })
// Expected: true
```

---

## 🔧 Data Isolation (5 min)

### Two User Test
1. **User 1:**
   - [ ] Login as user1@example.com
   - [ ] Create 2 orders
   - [ ] Note order count
   - [ ] Logout

2. **User 2:**
   - [ ] Login as user2@example.com
   - [ ] Check orders list
   - [ ] Should see 0 orders (or only User 2's) ✅
   - [ ] Create 1 order
   - [ ] Logout

3. **User 1 Again:**
   - [ ] Login as user1@example.com
   - [ ] Should still see 2 orders ✅
   - [ ] Should NOT see User 2's order ✅

---

## 📱 Mobile (5 min)

### Responsive Design
- [ ] Open on mobile device or emulator
- [ ] Login form displays correctly ✅
- [ ] Can tap inputs and buttons ✅
- [ ] Session persists after browser close ✅

---

## ✅ Pass Criteria

All checkboxes must be checked for test to pass.

**Total Time:** ~20-25 minutes

---

## Quick Verification Script

Run in browser console after login:

```javascript
async function quickTest() {
  console.log('🧪 Quick Auth Test\n')
  
  // 1. Check session
  const { data: { session } } = await supabase.auth.getSession()
  console.log('✅ Session:', !!session)
  
  // 2. Check API
  const res = await fetch('/api/orders')
  console.log('✅ API Status:', res.status)
  
  // 3. Check data
  if (res.ok) {
    const orders = await res.json()
    console.log('✅ Orders:', orders.length)
    console.log('✅ Has user_id:', orders.every(o => o.user_id))
  }
  
  console.log('\n✨ Test complete!')
}

quickTest()
```

---

## Issues Template

If you find issues, document them here:

```markdown
### Issue: [Title]
- **Severity:** High/Medium/Low
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
- **Expected:** What should happen
- **Actual:** What actually happened
- **Browser:** Chrome/Safari/Firefox
- **Device:** Desktop/Mobile
```
