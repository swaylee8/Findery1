# Scroll & Sold - Marketplace Application

## Overview
"Scroll & Sold" is a modern marketplace application designed for browsing homes, cars, and boats. It offers an immersive, full-screen vertical scrolling experience inspired by TikTok, featuring rich media content, glassmorphism overlays, and a minimalistic design. The project aims to provide a seamless and engaging browsing experience with a strong focus on mobile-first interaction and intuitive social features.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **UI**: Shadcn/ui (built on Radix UI) and Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter
- **Build**: Vite
- **Key UX Features**: TikTok-style full-screen vertical scrolling, Tinder-style card swiping, glassmorphism design, mobile-first responsive design, skeleton/shimmer loaders, offline caching, enhanced double-tap like functionality, and advanced media viewing (e.g., 360° photos).
- **Social Features**: Floating comment system, seller profile quick preview, enhanced share integration, live status indicators, direct messaging, and premium price display.
- **Visuals**: Dark theme with glassmorphism effects, minimalistic overlays, refined typography, and optimized mobile layout density.

### Backend
- **Framework**: Express.js with TypeScript
- **API**: RESTful with JSON responses
- **ORM**: Drizzle ORM for type-safe database operations
- **Runtime**: Node.js with ES modules
- **Authentication**: Simple email/password authentication with localStorage for session management.
- **Core Features**: CRUD operations for listings, category-based filtering, image upload support, and user-specific listing queries.

### Database
- **Primary**: PostgreSQL (configured for Neon Database)
- **Schema Management**: Drizzle Kit for migrations
- **Development Fallback**: In-memory storage (MemStorage)

### Data Flow
- Client uses TanStack Query; `apiRequest` utility handles HTTP requests.
- Server uses Express to route requests to storage interface methods.
- Authentication stores user data in localStorage after validation.

## External Dependencies

### Frontend & UI
- React, React DOM, React Query
- Radix UI primitives, Lucide React icons
- Tailwind CSS, Class Variance Authority
- React Hook Form, Zod (for validation)
- Framer Motion (for animations and gestures)

### Backend & Database
- Neon Database (PostgreSQL)
- Drizzle ORM
- Express.js
- ESBuild (for production builds)

### Development Tools
- TypeScript
- Vite
- TSX
- Replit Integration (runtime error modal, cartographer plugins)