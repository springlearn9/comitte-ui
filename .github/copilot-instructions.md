# Comitte UI - AI Coding Instructions

This is a React TypeScript application with NextUI components and Tailwind CSS for a committee management system with Spring Boot backend integration.

## Architecture Overview
- Frontend: React 18 + TypeScript + Vite
- UI Library: NextUI + Tailwind CSS + Framer Motion
- Backend: Spring Boot with Spring Security (https://github.com/springlearn9/comitte-app.git)
- Theme: Dark theme with NextUI components
- Authentication: JWT-based login system with context management

## Key Components
- `src/components/layout/` - Sidebar and Header layout components using NextUI
- `src/pages/` - Main application pages (Login with NextUI Card, Dashboard)
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/services/authService.ts` - API integration with Spring Boot backend
- `src/hooks/useAuth.ts` - Custom hook for accessing auth context

## Development Patterns
- Use NextUI components (Card, Input, Button, etc.) for consistent UI
- NextUIProvider wraps entire application with dark theme
- TypeScript interfaces for API responses and user data
- React Context API for authentication state management
- Axios interceptors for automatic JWT token handling and error responses
- Protected routes pattern with ProtectedRoute wrapper component

## API Integration
- Backend proxy configured in vite.config.ts for development
- Authentication endpoints: /api/auth/login, /api/auth/logout, /api/auth/me
- JWT tokens stored in localStorage and auto-included via Axios interceptors
- Automatic redirect to login on 401 responses

## Styling Conventions
- NextUI dark theme with custom color configuration
- Red primary color (#ef4444) for branding and active states
- Use NextUI component props (variant, color, size) over custom CSS
- Tailwind utilities for spacing and layout alongside NextUI components
- Responsive design using NextUI's responsive props and Tailwind classes