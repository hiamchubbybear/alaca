# Testing Authentication Flow

## How to Test

1. **Open the app** in your browser at `http://localhost:3000/`

2. **Open Browser Console** (F12 or Right-click → Inspect → Console tab)

3. **Test Signup Flow**:
   - Click "Login" button in navbar
   - Switch to "Sign up" tab
   - Fill in:
     - Email: `test@example.com`
     - Password: `Test@123`
     - Confirm Password: `Test@123`
   - Click "Sign Up"
   - **Watch the console** for logs:
     ```
     Attempting signup...
     Signup response: {...}
     Signup successful, attempting auto-login...
     Auto-login response: {...}
     Token saved, calling onSignupSuccess
     handleSignupSuccess called
     State set to: isLoggedIn=true, appState=onboarding
     Rendering with state: {appState: 'onboarding', isLoggedIn: true}
     ```
   - **Expected**: Modal closes, onboarding flow appears

4. **Test Login Flow**:
   - If you're already logged in, logout first
   - Click "Login" button
   - Fill in credentials
   - Click "Log In"
   - **Watch the console** for logs:
     ```
     Attempting login...
     Login response: {...}
     Token saved, calling onLoginSuccess
     handleLoginSuccess called
     State set to: isLoggedIn=true, appState=dashboard
     Rendering with state: {appState: 'dashboard', isLoggedIn: true}
     ```
   - **Expected**: Modal closes, dashboard appears

## Common Issues

### Issue: Modal closes but nothing appears

**Check console for**:

- Is `handleLoginSuccess` or `handleSignupSuccess` being called?
- What is the state after calling? (`isLoggedIn` and `appState`)
- Is the render condition matching?

### Issue: API errors

**Check console for**:

- "Login response" or "Signup response" - look at the response object
- Check if `res.success` is `true`
- Check if `res.data.accessToken` exists

### Issue: Token not saved

**Check console for**:

- "Token saved" message
- Check localStorage: `localStorage.getItem('accessToken')`

## Debug Commands

Open browser console and run:

```javascript
// Check current state
console.log('Token:', localStorage.getItem('accessToken'))
console.log('Is authenticated:', !!localStorage.getItem('accessToken'))

// Clear token (logout)
localStorage.removeItem('accessToken')
location.reload()
```
