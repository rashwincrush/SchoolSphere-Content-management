# EduConnect - Multi-Tenant School Management SaaS Platform

## Overview

EduConnect is a comprehensive multi-tenant SaaS platform for school management built as a modern web application. It provides subscription-based access to event management, content creation, social media automation, and multilingual support for educational institutions. The system features tenant isolation, subscription billing, and scalable multi-branch management for schools of all sizes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for global state, TanStack Query for server state
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with Material Design-inspired color system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handling
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit OpenID Connect integration

### Database Layer
- **Primary Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Connection**: Neon serverless driver with WebSocket support
- **Schema Management**: Drizzle Kit for migrations and schema updates

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC) for SSO
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Authorization**: Role-based access control (admin, teacher, parent, student)
- **Security**: HTTPOnly cookies with secure flag for production

### Multi-Branch Management
- **Branch Context**: React context for managing selected branch state
- **Branch Selector**: UI component for switching between branches
- **Data Isolation**: Branch-specific data filtering throughout the application
- **Centralized Analytics**: Cross-branch insights and reporting

### Event Management
- **CRUD Operations**: Full event lifecycle management
- **Categories**: Academic, sports, cultural, and other event types
- **RSVP System**: User registration and attendance tracking
- **Multi-language Support**: Event content translation capabilities

### Content Management
- **Post Creation**: Rich content creation with image support
- **Social Media Integration**: Automated posting to multiple platforms
- **Template System**: Pre-designed content templates
- **Scheduling**: Content scheduling and publication management

### Internationalization
- **Language Support**: English and Spanish with extensible architecture
- **Context Provider**: React context for language state management
- **Translation System**: Key-based translation with fallback support
- **Dynamic Content**: Real-time language switching without page refresh

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: OIDC redirect → token exchange → session creation → user context
2. **API Requests**: Authenticated requests with session cookies → Express middleware → Drizzle ORM → PostgreSQL
3. **Real-time Updates**: TanStack Query for optimistic updates and cache management
4. **Error Handling**: Centralized error boundaries with user-friendly messaging

### State Management Flow
1. **Global State**: React Context providers for authentication, branch selection, and language
2. **Server State**: TanStack Query for API data caching and synchronization
3. **Local State**: React hooks for component-specific state management
4. **Form State**: React Hook Form with Zod validation for type-safe form handling

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with serverless architecture
- **drizzle-orm**: Type-safe database ORM with excellent TypeScript support
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Unstyled, accessible UI components
- **react-hook-form**: Performant form handling with minimal re-renders
- **zod**: Runtime type validation and schema definition

### Development Tools
- **TypeScript**: Static type checking and enhanced developer experience
- **Vite**: Fast development server and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code formatting and linting

### Authentication & Session
- **openid-client**: OIDC client implementation
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management middleware

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR for frontend, tsx for backend
- **Database**: Neon serverless PostgreSQL with environment-based connection strings
- **Environment Variables**: Separate configurations for development and production

### Production Build
- **Frontend**: Vite production build with optimized bundling and asset handling
- **Backend**: ESBuild compilation to ES modules for Node.js execution
- **Static Assets**: Served through Express static middleware
- **Session Security**: Secure cookies with proper domain and security settings

### Database Management
- **Schema Migrations**: Drizzle Kit for version-controlled schema changes
- **Connection Pooling**: Neon serverless handles connection management automatically
- **Environment Isolation**: Separate database instances for development and production

### Monitoring & Logging
- **Request Logging**: Custom Express middleware for API request tracking
- **Error Handling**: Centralized error middleware with proper status codes
- **Performance**: Built-in logging for request duration and response analysis

The architecture prioritizes type safety, developer experience, and scalability while maintaining simplicity in deployment and maintenance. The use of modern tools like Drizzle ORM, TanStack Query, and Vite ensures excellent performance and developer productivity.