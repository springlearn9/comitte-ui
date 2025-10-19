# Committee UI - Modular Structure

## 📁 Project Structure

### 🔐 Authentication Module (`src/pages/auth/`)
- **SignIn.tsx** - Main login component with username/password form
- **SignUp.tsx** - User registration with basic form validation
- **ForgotPassword.tsx** - Password reset flow with email verification
- **UserRegistration.tsx** - Multi-step registration with personal info, address, and account setup
- **index.ts** - Exports all auth components for clean imports

### 🏛️ Committee Module (`src/pages/committee/`)
- **Committees.tsx** - Main committee list with tabs (My Committees / All Committees)
- **index.ts** - Exports all committee components for clean imports

### 🎨 Layout Components (`src/components/layout/`)
- **AuthLayout.tsx** - Shared layout for all authentication pages
- **Sidebar.tsx** - Main navigation sidebar with rounded pill buttons
- **Header.tsx** - Top navigation with search and user profile

## 🛠️ Key Features

### Modular Architecture
- ✅ Separated auth and committee functionality into distinct modules
- ✅ Clean import/export pattern using index files
- ✅ Reusable components with consistent styling
- ✅ Scalable structure for adding new features

### Authentication System
- ✅ **SignIn**: Clean login form with error handling
- ✅ **SignUp**: Registration with form validation
- ✅ **ForgotPassword**: Email-based password reset
- ✅ **UserRegistration**: 3-step registration process
- ✅ **AuthLayout**: Shared UI components for consistent auth pages

### Committee Management
- ✅ **Committees List**: Tabbed interface with owner grouping
- ✅ **My Committees**: Grouped by owner with expandable sections
- ✅ **All Committees**: Grid view of user-owned committees
- ✅ **Responsive Design**: Mobile-first approach

## 🔄 Routing Structure

### Auth Routes
- `/auth/signin` - Main login page
- `/auth/signup` - User registration
- `/auth/forgot-password` - Password reset
- `/auth/user-registration` - Full registration flow
- `/login` - Legacy route (redirects to `/auth/signin`)

### Protected Routes
- `/dashboard` - Main dashboard
- `/committees` - Committee management

### Default Routes
- `/` - Redirects to `/auth/signin`

## 🎯 Benefits of Modular Structure

### Developer Experience
- **Clear Separation**: Auth logic separate from business logic
- **Easy Navigation**: Intuitive folder structure
- **Consistent Imports**: Clean import paths using index files
- **Scalability**: Easy to add new features to respective modules

### Maintainability
- **Single Responsibility**: Each module handles specific functionality
- **Reusable Components**: Shared layouts and utilities
- **Type Safety**: TypeScript interfaces for all components
- **Error Boundaries**: Isolated error handling per module

### Future Development
- **Backend Integration**: Ready for Spring Boot API integration
- **Feature Expansion**: Easy to add new auth methods or committee features
- **Testing**: Isolated modules for easier unit testing
- **Code Splitting**: Potential for lazy loading modules

## 🚀 Getting Started

### Development Server
```bash
npm run dev
# Server runs at http://localhost:5174/
```

### Available Authentication Pages
1. **Sign In**: Basic username/password login
2. **Sign Up**: Quick registration form
3. **User Registration**: Detailed multi-step process
4. **Forgot Password**: Email-based password recovery

### Committee Features
1. **My Committees**: View all committees grouped by owner
2. **All Committees**: View committees you own
3. **Add Committee**: Ready for implementation
4. **Mobile Responsive**: Works across all devices

## 📋 Next Steps

### Immediate Development
- [ ] Connect auth components to Spring Boot backend
- [ ] Implement actual API calls for registration/login
- [ ] Add committee creation functionality
- [ ] Implement committee details page

### Future Enhancements
- [ ] Add committee member management
- [ ] Implement bid system
- [ ] Add user profile management
- [ ] Create admin dashboard
- [ ] Add notification system

---

*Last Updated: October 19, 2025*