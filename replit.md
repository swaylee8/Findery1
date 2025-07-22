# Scroll & Sold - Marketplace Application

## Overview

This is a modern marketplace application called "Scroll & Sold" built with React, Express, and PostgreSQL. The app allows users to browse, like, and message about listings for homes, cars, and boats in an Instagram-like social media interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Runtime**: Node.js with ES modules

### Database
- **Primary Database**: PostgreSQL (configured for Neon Database)
- **Schema Management**: Drizzle Kit for migrations
- **Storage Strategy**: In-memory fallback (MemStorage) for development

## Key Components

### Authentication System
- Simple email/password authentication
- JWT-less session management using localStorage
- User registration and login endpoints
- Client-side auth state management with custom hook

### Listing Management
- CRUD operations for marketplace listings
- Category-based filtering (homes, cars, boats)
- Image upload support (currently mock implementation)
- User-specific listing queries

### Social Features
- Like/unlike functionality for listings
- Messaging system between users
- Instagram-like feed interface
- User profiles with listing history

### Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom navigation pattern
- Touch-friendly interactions
- Safe area handling for mobile browsers

## Data Flow

### Client-Server Communication
1. React components use TanStack Query hooks for data fetching
2. Custom `apiRequest` utility handles HTTP requests with error handling
3. Server responds with JSON data and appropriate HTTP status codes
4. Client-side state automatically updates via query invalidation

### Database Operations
1. Express routes receive HTTP requests
2. Route handlers call storage interface methods
3. Storage layer (currently in-memory, designed for PostgreSQL) performs CRUD operations
4. Results flow back through the response chain

### Authentication Flow
1. User submits login/register form
2. Server validates credentials and returns user data
3. Client stores user data in localStorage
4. Subsequent requests include user context for authorization

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, Class Variance Authority
- **Forms**: React Hook Form with Zod validation

### Database & Backend
- **Database**: Neon Database (PostgreSQL), Drizzle ORM
- **Server**: Express.js, TypeScript, ESBuild for production builds
- **Development**: Vite, TSX for development server

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development builds and HMR
- **Replit Integration**: Runtime error modal and cartographer plugins

## Deployment Strategy

### Development Environment
- Vite dev server serves React application
- Express server runs in development mode with TSX
- Hot module replacement for fast iteration
- File watching for automatic rebuilds

### Production Build
- Vite builds optimized React bundle to `dist/public`
- ESBuild compiles Express server to `dist/index.js`
- Single Node.js process serves both static files and API
- Environment variable configuration for database connection

### Database Setup
- Drizzle Kit manages schema migrations
- PostgreSQL connection via DATABASE_URL environment variable
- Shared schema types between frontend and backend
- Fallback to in-memory storage for development without database

The application follows a monorepo structure with shared TypeScript types, enabling full-stack type safety and efficient development workflows.