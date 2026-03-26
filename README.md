# Pineapple Wallet Frontend

A modern, full-featured financial portfolio management application built with Next.js. Pineapple Wallet helps you track all your assets in one place — bank accounts, real estate, crypto, stocks, and investments — and share your portfolio with partners for collaborative financial planning.

## 🍍 Features

- **Unified Asset Tracking**: Manage all your financial assets in one dashboard
  - Bank accounts
  - Real estate
  - Cryptocurrency
  - Stocks and investments
  - Custom asset types

- **Portfolio Management**: Create and organize multiple portfolios
  - Add, edit, and delete portfolios
  - Track asset values and history
  - Visual analytics with charts and graphs

- **Collaborative Sharing**: Share portfolios with partners
  - Invite users via email
  - Control access permissions (view/edit)
  - Manage invitations and shared portfolios

- **Multi-Currency Support**:
  - Track assets in different currencies
  - Automatic currency conversion
  - View net worth in your preferred currency

- **Secure Authentication**:
  - JWT-based authentication with refresh tokens
  - Protected routes and API endpoints
  - Persistent session management

- **Modern UI/UX**:
  - Beautiful, responsive design
  - Tailwind CSS styling
  - Intuitive navigation and user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.3.3
- **UI Library**: React 18.2.0
- **State Management**: Zustand 4.4.7
- **HTTP Client**: Axios 1.6.5
- **Form Handling**: React Hook Form 7.49.3 + Zod 3.22.4
- **Charts**: Recharts 2.10.4
- **Icons**: Lucide React 0.309.0
- **Styling**: Tailwind CSS 3.4.1
- **Utilities**: clsx, tailwind-merge

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server running (see backend repository)

## 🚀 Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yuv-man/pineapple-wallet-client.git
cd pineapple-wallet-client
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Application Mode: 'dev' or 'prod'
NEXT_PUBLIC_MODE=dev

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3003/api
NEXT_PUBLIC_API_URL_DEV=http://localhost:3003/api
NEXT_PUBLIC_API_URL_PROD=https://api.yourdomain.com/api

# Public URLs (for OAuth callbacks, etc.)
NEXT_PUBLIC_PUBLIC_URL_DEV=http://localhost:3003
NEXT_PUBLIC_PUBLIC_URL_PROD=https://yourdomain.com
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser.

### Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Linting

Run ESLint:

```bash
npm run lint
```

### Mobile app icon (Android / iOS)

The app uses the Pineapple Wallet icon from `public/` for the web (favicon, PWA manifest, sidebar, and auth pages). For native launcher and splash icons on Android/iOS:

1. Add a 1024×1024 PNG as `assets/logo.png` (e.g. export from `assets/pineapple-wallet-logo.webp`).
2. Install and run the asset generator:

```bash
npm install --save-dev @capacitor/assets
npm run assets:generate
```

This updates the icons in the `android/` (and `ios/` if present) projects.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── (dashboard)/       # Dashboard route group
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── portfolios/    # Portfolio management
│   │   │   ├── assets/        # Asset management
│   │   │   ├── invitations/   # Invitation management
│   │   │   ├── shared/        # Shared portfolios
│   │   │   └── settings/      # User settings
│   │   ├── auth/              # Auth callbacks
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable React components
│   │   ├── AuthGuard.tsx     # Route protection component
│   │   └── Sidebar.tsx        # Navigation sidebar
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts            # API client and endpoints
│   │   └── utils.ts          # Helper functions
│   ├── store/                # State management (Zustand)
│   │   └── auth.ts           # Authentication store
│   └── types/                # TypeScript type definitions
│       └── index.ts          # Shared types
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## 🔌 API Integration

The frontend communicates with a backend API. All API calls are centralized in `src/lib/api.ts`:

- **Authentication**: Register, login, logout, token refresh
- **Users**: Get profile, update profile, search users
- **Portfolios**: CRUD operations for portfolios
- **Assets**: CRUD operations for assets within portfolios
- **Sharing**: Share portfolios, manage invitations, update permissions
- **Currency**: Exchange rates, currency conversion, net worth calculations

The API client automatically:

- Adds authentication tokens to requests
- Handles token refresh on 401 errors
- Redirects to login on authentication failure

## 🔐 Authentication Flow

1. User registers/logs in via `/login` or `/register`
2. Backend returns access token and refresh token
3. Tokens are stored in Zustand store with persistence
4. All API requests include the access token
5. On 401 errors, the refresh token is used to get a new access token
6. On refresh failure, user is logged out and redirected to login

## 🎨 Styling

The project uses Tailwind CSS with custom configuration:

- Custom color palette (pineapple theme)
- Responsive design utilities
- Component classes for consistent styling
- Dark mode support (if configured)

## 📝 Environment Variables

| Variable                      | Description                                       | Default                     |
| ----------------------------- | ------------------------------------------------- | --------------------------- |
| `NEXT_PUBLIC_MODE`            | Application mode: 'dev' or 'prod'                 | 'dev' (auto-detected)       |
| `NEXT_PUBLIC_API_URL`         | Backend API base URL (fallback)                   | `http://localhost:3003/api` |
| `NEXT_PUBLIC_API_URL_DEV`     | Backend API URL for development mode              | `http://localhost:3003/api` |
| `NEXT_PUBLIC_API_URL_PROD`    | Backend API URL for production mode               | `http://localhost:3003/api` |
| `NEXT_PUBLIC_PUBLIC_URL_DEV`  | Public frontend URL for development (OAuth, etc.) | `http://localhost:3003`     |
| `NEXT_PUBLIC_PUBLIC_URL_PROD` | Public frontend URL for production (OAuth, etc.)  | `http://localhost:3003      |

### Mode Configuration

The application uses `NEXT_PUBLIC_MODE` to switch between development and production configurations:

- **Development Mode** (`NEXT_PUBLIC_MODE=dev`):
  - Uses `NEXT_PUBLIC_API_URL_DEV` for API calls
  - Uses `NEXT_PUBLIC_PUBLIC_URL_DEV` for public URLs
  - Defaults to 'dev' if not set and `NODE_ENV !== 'production'`

- **Production Mode** (`NEXT_PUBLIC_MODE=prod`):
  - Uses `NEXT_PUBLIC_API_URL_PROD` for API calls
  - Uses `NEXT_PUBLIC_PUBLIC_URL_PROD` for public URLs
  - Defaults to 'prod' if not set and `NODE_ENV === 'production'`

You can use the utility functions from `@/lib/utils` to access mode and URLs programmatically:

- `getMode()` - Returns current mode ('dev' or 'prod')
- `getPublicUrl()` - Returns the public URL based on current mode
- `isProduction()` - Returns true if in production mode
- `isDevelopment()` - Returns true if in development mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🐛 Troubleshooting

### API Connection Issues

- Ensure the backend server is running
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Verify CORS settings on the backend

### Authentication Issues

- Clear browser localStorage (auth tokens are persisted)
- Check token expiration times
- Verify refresh token endpoint is working

### Build Errors

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## 📞 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js and React
