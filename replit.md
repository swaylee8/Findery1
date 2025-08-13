# Findery - Marketplace Application

## Overview
"Findery" is a modern marketplace application designed for browsing homes, cars, and boats. It offers an immersive, full-screen vertical scrolling experience inspired by TikTok, featuring rich media content, glassmorphism overlays, and a minimalistic design. The project aims to provide a seamless and engaging browsing experience with a strong focus on mobile-first interaction and intuitive social features.

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

## Recent Updates (January 2025)

### App Rebranding to "Findery" (January 2025)
- **Complete Name Change**: Updated all app references from "Scroll & Sold" to "Findery" across the entire application
- **Enhanced Branding**: Updated HTML metadata, titles, and Open Graph tags with "Findery - Discover Homes, Cars & Boats"
- **Mobile App Support**: Added comprehensive app manifest for mobile installation with proper theming and orientation
- **Consistent UI**: Updated all user-facing text, loading screens, and navigation menus to display "Findery"
- **SEO Optimization**: Improved meta descriptions and social media sharing with new brand messaging
- **Progressive Web App**: Enhanced mobile app experience with proper manifest.json for standalone installation

## Recent Updates (January 2025)

### Audio Removal & Silent Operation
- **Complete Audio Elimination**: Removed all sound effects including scroll sounds, like/unlike feedback, notification pings
- **Maintained Responsiveness**: Preserved haptic feedback and visual animations for user interaction feedback
- **Silent Browsing**: App now operates completely silently across all platforms while maintaining engagement

### Navigation Overhaul & Mobile Layout Optimization
- **Bottom Navigation Removal**: Completely removed bottom navigation bar from mobile view across all pages
- **Hamburger Menu Integration**: Moved Home, Messages, Profile, and Alerts navigation to top-left hamburger menu with glassmorphism styling
- **Full-Screen Content**: Content now extends to bottom of screen without navigation bar padding for maximum mobile density
- **Consistent Menu Design**: Navigation buttons feature proper haptic feedback, smooth animations, and recognizable icons with text labels
- **Mobile-First Approach**: Navigation optimized for thumb-friendly touch targets and comfortable mobile usage

### UI Component Improvements 
- **Price Badge Repositioning**: Moved "Price Drop" and "Great Deal" badges to left side with enhanced glassmorphism
- **Action Button Enhancement**: Updated top-right action buttons with reduced blur, improved contrast, and accessibility
- **Add Listing Button Relocation**: Moved add-listing "plus" button from main navigation to Profile section with premium glassmorphism styling
- **360° and AR Removal**: Completely removed 360° photo viewer and AR preview functionality for streamlined experience
- **Mobile Optimization**: Better responsive spacing and touch targets for iPhone compatibility

### Feed Algorithm & Navigation Implementation
- **Removed All Swipe Gestures**: Eliminated horizontal swipe functionality for like/dislike interactions
- **Smooth Vertical Scrolling**: Pure TikTok-style vertical scrolling without horizontal gesture conflicts
- **Auto-Cycling Categories**: Feed automatically cycles through All → Homes → Cars → Boats → repeat pattern
- **Button-Only Interactions**: All like/save/share actions handled exclusively via on-screen buttons
- **Category Headers**: Lightweight glassmorphism category headers between content sections

### Technical Feed Architecture
- **Cyclic Feed Algorithm**: `generateCyclicFeed()` creates seamless category transitions with 8 items per section
- **Section Headers**: `CategoryHeader` component with glassmorphism styling and category-specific icons
- **Infinite Scrolling**: Maintains lazy loading and smart preloading while respecting category order
- **Performance Optimized**: Category cycling with efficient re-rendering and memory management
- **Smooth Transitions**: Enhanced scroll handling with 300ms animation timing and coordinated UI element transitions
- **Preloading**: Increased preload distance to 3 items with batch size of 4 for seamless content availability

### User Experience Improvements
- **Natural Category Discovery**: Users encounter all categories automatically without manual switching
- **Reduced Cognitive Load**: No need to remember or manually navigate between category tabs
- **Immersive Browsing**: Uninterrupted vertical scroll experience like social media feeds
- **Mobile-First Design**: Category headers sized and positioned for optimal mobile viewing density
- **Seamless Listing Transitions**: Coordinated 200-300ms fade/slide animations for seller info, online status dots, and deal badges
- **Premium Animation Feel**: Staggered entry animations eliminate jarring pop-ins with consistent glassmorphism styling
- **Mobile-Optimized Performance**: 60fps animations with preloaded content and smooth scroll snapping