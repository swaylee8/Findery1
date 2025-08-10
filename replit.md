# Scroll & Sold - Marketplace Application

## Overview

This is a modern marketplace application called "Scroll & Sold" built with React, Express, and PostgreSQL. The app now features a full-screen vertical scrolling TikTok-style interface for browsing homes, cars, and boats with immersive media content, glassmorphism overlays, and modern minimalistic design.

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
- Swipe mode toggle (Tinder Cards vs Grid view)
- Bottom-sheet quick filters with smart category-specific options
- Skeleton/shimmer loaders for all image loading states
- Offline cache for last feed with automatic sync

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

## Recent UX Improvements (January 2025)

### Advanced User Experience Features
- **Tinder-style Card Swiping**: Users can toggle between grid view and swipe mode for browsing listings with smooth drag animations
- **Smart Bottom-sheet Filters**: Category-specific filtering with price ranges, bedrooms (homes), mileage/year (cars), and ZIP code targeting
- **Skeleton Loading States**: Comprehensive shimmer loaders for all images and content to improve perceived performance
- **Offline Capabilities**: Automatic caching of the last feed with 5-minute TTL and offline mode indicators
- **Enhanced Mobile UX**: Improved touch interactions, gesture controls, and seamless view mode transitions

### Implementation Details
- Framer Motion for smooth swipe animations and gestures
- Local storage-based offline caching with automatic data freshness checks
- Category-aware filtering system with dynamic UI components
- Progressive image loading with skeleton placeholders
- Real-time online/offline status indicators

## Latest Updates (January 2025)

### Enhanced Double-Tap Like Functionality
- **Toggle Behavior**: Double-tap now properly toggles between like and unlike states, matching the heart button behavior
- **Visual Feedback**: Different animations for liking (red heart) vs unliking (broken heart effect with shake animation)
- **Audio Feedback**: Different sounds for like vs unlike actions to provide clear user feedback
- **Consistent UX**: Double-tap and heart button now have identical toggle behavior for seamless interaction

## TikTok-Style Interface Transformation (January 2025)

### Major UI/UX Overhaul
- **Full-Screen Vertical Scrolling**: Each listing now takes up the entire viewport with smooth snap-to-section behavior
- **Dark Theme with Glassmorphism**: Modern black interface with semi-transparent overlays and blur effects
- **Video-First Experience**: Auto-playing videos (muted start) with tap controls and volume management
- **Minimalistic Overlays**: Essential information displayed over media content with large typography
- **Floating Navigation**: Top hamburger menu, floating action button, and bottom tab bar

### Enhanced Video Integration
- Priority given to video listings in feed algorithm
- Automatic video playback when listings come into view
- Video controls (play/pause on tap, mute toggle)
- Full-screen video viewing capability
- Video duration indicators

### Modern Mobile UX
- Infinite scroll with lazy loading
- Pull-to-refresh functionality
- Swipe gestures for interactions
- Scroll progress indicators
- Keyboard navigation support (arrow keys)

### Technical Implementation
- CSS scroll-snap for precise viewport alignment
- Backdrop-filter for glassmorphism effects
- Video element optimization for mobile performance
- Custom scrollbar hiding for immersive experience

## Social Features Integration (January 2025)

### Advanced Social Elements
- **Floating Comment System**: Tap comment bubble to see overlay with threaded discussions without leaving listing view
- **Seller Profile Quick Preview**: Tap seller avatar for instant popup with bio, listings count, and action buttons
- **Enhanced Share Integration**: Native social sharing with rich media previews and formatted text
- **Live Status Indicators**: Real-time online/offline status for sellers with "Active now" and "Last seen" timestamps
- **Direct Messaging**: Instant message buttons for immediate seller contact

### Social UX Features
- **Online Status Dots**: Green indicator dots on seller avatars when active
- **Comment Engagement**: View and add comments with user avatars and timestamps
- **Profile Bio Display**: Rich seller information with specialization and experience details
- **Interactive Seller Cards**: Expandable seller profiles with all listings and contact options
- **Social Proof Elements**: Listing counts, activity status, and engagement metrics

### Technical Implementation
- Real-time status simulation with randomized online states
- Glassmorphism overlays for social panels
- Smooth slide-up animations for all social interactions
- Mock seller and comment data with realistic profiles and content
- Touch-optimized social interaction patterns

## Enhanced Listing Experience (January 2025)

### Advanced Viewing Features
- **360° Photo Viewer**: Immersive full-screen gallery with swipe navigation through all property angles
- **AR Preview Integration**: "View in your space" functionality for applicable items with camera overlay
- **Multi-Image Navigation**: Swipe between listing photos with dot indicators and smooth transitions
- **Enhanced Media Controls**: Professional image viewing with zoom and navigation controls

### Market Intelligence
- **Price History Charts**: Visual timeline showing price changes with savings indicators and trend analysis
- **Similar Listings Carousel**: Horizontal scroll of related properties with quick comparison and contact options
- **Market Insights**: Price drop notifications and comparative market analysis

### Advanced Saving System
- **Custom Board Categories**: Save to themed collections like "Dream Homes," "Weekend Cars," "Vacation Boats"
- **Smart Board Suggestions**: Category-specific board recommendations based on listing type
- **Quick Save Actions**: One-tap saving to multiple boards with visual feedback

### Enhanced User Experience
- **Progressive Image Loading**: Smart preloading with blur-to-sharp transitions
- **Touch Gesture Controls**: Intuitive swipe, tap, and long-press interactions
- **Visual Feedback Systems**: Haptic feedback and sound effects for all interactions
- **Contextual Action Buttons**: Top-right floating buttons for 360°, AR, and price history

### Technical Implementation
- Framer Motion animations for smooth transitions and gestures
- State management for multiple overlay systems
- Mock data integration for price history and similar listings
- Touch-optimized navigation with gesture recognition
- Glassmorphism design language throughout all interfaces

## Enhanced Price Display (January 2025)

### Premium Price Styling
- **Eye-catching Dollar Signs**: Larger, bold typography with gradient effects to draw shopper attention
- **Animated Price Badges**: Glowing background with pulse animations and sparkle effects for premium feel
- **Gradient Color Scheme**: Green-to-emerald gradient suggesting money and value throughout price displays
- **Visual Hierarchy**: Strategic sizing with dollar sign slightly smaller than amount for optimal readability
- **Backdrop Effects**: Semi-transparent backgrounds with blur effects and subtle borders for better contrast

### Shopper Appeal Features
- **Pulse Animations**: Gentle pulsing effects to make prices feel dynamic and attention-grabbing
- **Sparkle Indicators**: Small animated dots suggesting deals and value
- **High Contrast**: Black backgrounds with bright green text for maximum visibility
- **Consistent Branding**: Same styling applied across all price displays (main, history, similar listings)
- **Professional Typography**: Font-black weight with tight tracking for modern, premium appearance