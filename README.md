# LucoTicket - Ticketing Marketplace Frontend

A modern, full-stack ticketing marketplace application built with Next.js, connecting event sellers with customers.

## Features

### Customer Features
- Browse and search events with advanced filtering
- Book tickets with secure payment processing (Pesapal)
- View and manage bookings
- Digital ticket management with QR codes
- Real-time booking updates
- User profile management

### Seller Features
- Create and manage event campaigns
- Track bookings and sales in real-time
- Comprehensive analytics dashboard
- Financial management and withdrawal requests
- Team management (add managers)
- Real-time notifications for new bookings

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: 
  - Zustand (global state)
  - TanStack Query v5 (server state)
- **Forms**: React Hook Form + Zod validation
- **API Client**: Axios with retry logic
- **Real-time**: Socket.io
- **Animations**: GSAP
- **Payments**: Pesapal integration

## Project Structure

\`\`\`
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── apply-seller/
│   ├── (customer)/          # Customer portal
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── bookings/
│   │   ├── tickets/
│   │   └── profile/
│   ├── (seller)/            # Seller portal
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── analytics/
│   │   ├── finance/
│   │   └── managers/
│   └── payment/             # Payment callbacks
├── components/
│   ├── customer/            # Customer-specific components
│   ├── seller/              # Seller-specific components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── api/                 # API client functions
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand stores
│   ├── utils/               # Utility functions
│   └── validations/         # Zod schemas
└── middleware.ts            # Route protection

\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd ticketing-marketplace
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
Create a `.env.local` file:
\`\`\`env
NEXT_PUBLIC_API_URL=https://ticketing-marketplace.onrender.com
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Key Features Implementation

### Authentication
- Email/password authentication
- Google OAuth integration
- Seller application workflow
- Session management with automatic token refresh
- Protected routes via middleware

### Real-time Updates
- Socket.io integration for live booking updates
- Automatic query invalidation on real-time events
- Toast notifications for booking changes

### Payment Integration
- Pesapal payment gateway integration
- Secure payment callback handling
- Payment verification and booking confirmation

### State Management
- **Auth Store**: User session and authentication state
- **UI Store**: Sidebar, modals, and UI preferences
- **Booking Store**: Temporary booking data during checkout
- **TanStack Query**: Server state with optimized caching

### API Layer
- Centralized Axios configuration
- Automatic retry logic for failed requests
- Token refresh on 401 errors
- Request/response interceptors
- Type-safe API functions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Design System

The application uses a dark theme inspired by Vercel's design language:
- Pure black backgrounds (#000000)
- High contrast white text
- Subtle gray borders (white/10)
- Minimal accent colors
- Clean, professional aesthetic

## API Integration

Backend API: `https://ticketing-marketplace.onrender.com`

Key endpoints:
- `/auth/*` - Authentication
- `/campaigns/*` - Event campaigns
- `/bookings/*` - Ticket bookings
- `/payments/*` - Payment processing
- `/finance/*` - Financial operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License
