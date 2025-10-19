# Comitte UI - Committee Management System

A modern React TypeScript application with NextUI components for managing committees, members, and bids.

## Features

- **Authentication**: JWT-based login system with Spring Boot backend integration
- **Dark Theme**: Modern dark UI with NextUI components and Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Committee Management**: Dashboard for managing committees, members, and bids
- **Real-time Updates**: Live data synchronization with backend

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: NextUI + Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Animation**: Framer Motion (NextUI dependency)

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd comitte-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Backend Setup

This frontend requires the Spring Boot backend to be running:
- Backend repository: https://github.com/springlearn9/comitte-app.git
- Default backend URL: `http://localhost:8080`
- Configure the API base URL in environment variables if needed

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── layout/         # Layout components (Header, Sidebar)
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── pages/              # Page components (Login, Dashboard)
├── services/           # API services
└── utils/              # Utility functions
```

## API Integration

The application integrates with a Spring Boot backend:

- **Authentication**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **JWT Tokens**: Stored in localStorage, auto-included in requests
- **Error Handling**: Automatic redirect to login on 401 responses

## Styling

- **NextUI**: Primary component library with dark theme
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Classes**: Extended Tailwind config for consistent theming
- **Dark Mode**: Default dark theme with red accent colors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
