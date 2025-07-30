# User Creation Testing Checklist

## Before Testing:
✅ **Firebase Configuration**: Make sure you've replaced the placeholder values in `environment.ts` with your actual Firebase config
✅ **Firebase Console Setup**: 
   - Firestore Database created and enabled
   - Authentication enabled with Email/Password provider
✅ **Angular Dev Server**: Restart with `ng serve` after Firebase configuration

## Test Scenarios:

### 1. Navigation Test
- [ ] Go to User Management dashboard
- [ ] Click "Add New User" section
- [ ] Should navigate to `/create-user-account`

### 2. Form Validation Test (Step 1)
- [ ] Try submitting empty form - should show validation errors
- [ ] Fill only some fields - should not proceed to step 2
- [ ] Fill all required fields - should proceed to step 2

### 3. Photo Upload Test
- [ ] Click photo upload area
- [ ] Select an image file
- [ ] Image should preview in the upload area

### 4. Form Validation Test (Step 2)
- [ ] Try submitting without role/password
- [ ] Enter password less than 6 characters
- [ ] Fill all fields correctly

### 5. User Creation Test
- [ ] Complete both steps with valid data
- [ ] Click "Create Account"
- [ ] Should show loading state
- [ ] Should create Firebase Auth account
- [ ] Should save user data to Firestore
- [ ] Should redirect to login page
- [ ] Should show success message

### 6. Firebase Verification
Check Firebase Console:
- [ ] **Authentication**: New user appears in Users tab
- [ ] **Firestore**: New document in `users` collection with correct data structure

## Test Data Example:
```
Full Name: Brown Test User
Email: lee.brown@example.com (use unique email each time)
Phone: +263787640780
Department: SHEQ
Province: Mash West
Role: Employee
Password: testpass123
```

## Expected Data Structure in Firestore:
```javascript
{
  uid: "firebase-generated-uid",
  fullName: "John Test User",
  email: "lee.brown@example.com",
  phone: "+263787640780",
  department: "SHEQ",
  province: "Mash West", 
  role: "Employee",
  profilePhoto: "base64-string-or-empty",
  status: "Active",
  createdAt: "2024-12-15T10:30:00.000Z",
  lastLogin: "2024-12-15T10:30:00.000Z",
  trainingCompleted: false
}
```

## Common Issues to Watch For:
- **Firebase config errors**: Check browser console for configuration issues
- **Form validation**: Ensure all required fields are filled
- **Email already exists**: Firebase will throw error if email is already registered
- **Network issues**: Check internet connection and Firebase project status

Good luck with testing! 🧪✨
