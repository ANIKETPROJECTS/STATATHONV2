# SafeData Pipeline

## Overview
SafeData Pipeline is an enterprise-grade Data Privacy Protection and Anonymization System developed for the Government of India's Ministry of Electronics and Information Technology. The system provides comprehensive tools for data privacy enhancement, risk assessment, and compliance reporting.

## Current State
The application is fully functional with the following features:
- JWT-based authentication with role-based access control (Administrator, Data Analyst, Privacy Officer)
- Data upload supporting CSV, XLSX, and JSON formats
- Risk assessment with k-anonymity violation detection
- Privacy enhancement techniques: K-Anonymity, L-Diversity, T-Closeness, Differential Privacy, Synthetic Data
- Utility measurement with statistical comparison
- Report generation in HTML format
- Pre-built privacy configuration profiles

## Default Login
- Username: `admin`
- Password: `admin@123`

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React with TypeScript, Vite bundler
- **Routing**: wouter
- **State Management**: TanStack Query for server state
- **UI Components**: shadcn/ui with Radix primitives
- **Styling**: Tailwind CSS with custom theme
- **Charts**: Recharts for data visualization

### Backend (Express + TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Session**: express-session with PostgreSQL store
- **File Processing**: multer for uploads, papaparse and xlsx for parsing

### Database Schema
- `users`: User accounts with roles and permissions
- `datasets`: Uploaded data files with quality metrics
- `risk_assessments`: K-anonymity risk analysis results
- `privacy_operations`: Applied anonymization operations
- `utility_measurements`: Data utility comparisons
- `reports`: Generated compliance reports
- `config_profiles`: Privacy configuration presets
- `activity_logs`: User activity tracking

## File Structure
```
client/src/
├── components/         # UI components
│   ├── ui/            # shadcn components
│   ├── app-sidebar.tsx
│   ├── dashboard-layout.tsx
│   └── theme-toggle.tsx
├── hooks/             # Custom hooks
│   ├── use-auth.tsx
│   └── use-theme.tsx
├── lib/               # Utilities
│   ├── protected-route.tsx
│   └── queryClient.ts
├── pages/             # Page components
│   ├── auth-page.tsx
│   ├── home-page.tsx
│   ├── upload-page.tsx
│   ├── risk-page.tsx
│   ├── privacy-page.tsx
│   ├── utility-page.tsx
│   ├── reports-page.tsx
│   ├── config-page.tsx
│   ├── profile-page.tsx
│   └── help-page.tsx
└── App.tsx            # Main app with routing

server/
├── auth.ts            # Authentication setup
├── db.ts              # Database connection
├── index.ts           # Server entry point
├── routes.ts          # API endpoints
└── storage.ts         # Data access layer

shared/
└── schema.ts          # Database schema and types
```

## Recent Changes
- December 12, 2025: Initial implementation with all core features
  - Complete authentication system with role-based access
  - Full data pipeline: upload → assess → anonymize → measure → report
  - Enterprise dashboard with visualizations
  - Dark/light theme support

## User Preferences
- Enterprise dashboard design with Government of India branding
- Professional blue (#2563EB) and white color scheme
- CRM-style interface similar to Salesforce/Linear
- Multi-colored chart visualizations
