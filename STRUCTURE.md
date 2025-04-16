# Aetherion Blockchain Wallet Project Structure

This document outlines the project's architecture, file organization, and key components to help developers understand how the system is structured.

## Overview

Aetherion is a cutting-edge blockchain wallet platform with a focus on security, usability, and quantum-resistant blockchain integration. The application is built with a React frontend (using TypeScript) and a Node.js backend with Express.

The platform features a quantum-secure API architecture with three distinct layers:
1. **Client Layer**: User interface and frontend logic
2. **API Gateway**: Security intermediary with quantum validation
3. **Backend Services**: Core business logic and data storage

This quantum-resistant API architecture ensures:
- Complete separation between frontend and backend services
- All API requests are verified through quantum-resistant validation
- Defense against both classical and quantum-computing based attacks
- Consistent application of security policies across all services

## Directory Structure

```
aetherion-wallet/
├── .backup/                  # Auto-generated backup directory
├── .github/                  # GitHub configuration and templates
├── api-gateway/              # API Gateway with quantum security
│   ├── src/                  # Gateway source code
│   │   └── index.ts          # Main API Gateway implementation
│   └── tsconfig.json         # TypeScript configuration
├── quantum-validator/        # Quantum security validation module
│   ├── src/                  # Validator source code
│   │   └── validator.ts      # Request validation implementation
│   └── tsconfig.json         # TypeScript configuration
├── client/                   # Frontend application code
│   ├── public/               # Static assets
│   └── src/                  # React application source code
│       ├── assets/           # Frontend assets (images, fonts)
│       ├── components/       # React components
│       │   ├── dashboard/    # Dashboard-specific components
│       │   ├── layout/       # Layout components
│       │   ├── shared/       # Shared/reusable components
│       │   └── ui/           # UI components (shadcn, buttons, etc.)
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Utility functions and client libraries
│       │   └── queryClient.ts # API Gateway-aware query client
│       ├── pages/            # Page components
│       ├── simulation/       # Bot Simulation System
│       │   ├── apiClient.ts  # Simulation API client infrastructure
│       │   ├── botActions.ts # Bot behavior and action definitions
│       │   ├── botSystem.ts  # Core bot framework and types
│       │   ├── Dashboard.tsx # Bot monitoring interface
│       │   └── utils.ts      # Simulation utilities
│       └── types/            # TypeScript type definitions
├── server/                   # Backend server code
│   ├── api/                  # API routes and controllers
│   ├── db/                   # Database connection and migrations
│   ├── middleware/           # Express middleware
│   │   └── gateway-validation.ts # Gateway validation guard
│   ├── routes/               # Route definitions
│   ├── services/             # Service layer (business logic)
│   │   ├── twilio.ts         # Twilio SMS integration service
│   │   └── ...
│   └── utils/                # Server utilities
├── shared/                   # Shared code between frontend and backend
│   ├── constants/            # Shared constants
│   ├── schema.ts             # Database schema definitions
│   ├── types/                # Shared TypeScript type definitions
│   └── validation/           # Validation schemas
└── scripts/                  # Utility scripts
```

## Key Components

### Frontend

1. **App.tsx**: The entry point for the React application, setting up routes and global context.
2. **components/layout/MainLayout.tsx**: The main layout wrapper that includes navigation and common UI elements.
3. **components/dashboard/PortfolioChart.tsx**: Chart visualization for user portfolio data.
4. **components/dashboard/NotificationSettings.tsx**: UI for managing notification preferences.
5. **hooks/use-theme.ts**: Hook for theme handling throughout the application.

### API Gateway & Security Layer

1. **api-gateway/src/index.ts**: API Gateway that validates and routes requests.
2. **quantum-validator/src/validator.ts**: Quantum-resistant security validation.
3. **server/middleware/gateway-validation.ts**: Backend validation of gateway headers.

### Backend

1. **server/index.ts**: The main server entry point that sets up Express and middleware.
2. **server/db.ts**: Database connection setup.
3. **server/routes.ts**: API route registration.
4. **server/services/twilio.ts**: Twilio integration for SMS notifications.
5. **server/pg-storage.ts**: PostgreSQL database interface implementation.

### Bot Simulation System

1. **client/src/simulation/botSystem.ts**: Core framework for creating and managing bot instances.
2. **client/src/simulation/apiClient.ts**: API client framework for bot interactions with endpoints.
3. **client/src/simulation/botActions.ts**: Comprehensive set of actions bots can perform.
4. **client/src/simulation/Dashboard.tsx**: Visual interface for monitoring and managing bots.
5. **client/src/pages/BotSimulation.tsx**: Main entry point for the simulation system.

### Shared

1. **shared/schema.ts**: Drizzle ORM schema definitions shared between frontend and backend.
2. **shared/types/**: Type definitions used across the application.

## Database Schema

The database is designed with the following core entities:

1. **User**: Account information and authentication details.
2. **Wallet**: Blockchain wallet information linked to users.
3. **Transaction**: Record of blockchain transactions.
4. **SmartContract**: Smart contract deployments and interactions.
5. **NotificationPreference**: User preferences for various types of notifications.
6. **WalletHealthScore**: Security and health metrics for wallets.
7. **PaymentMethod**: User payment methods for purchasing crypto.
8. **CidEntry**: Content-addressable storage entries for blockchain data.

## Authentication Flow

1. User registers or logs in through the authentication pages.
2. Server validates credentials and issues a session token.
3. Frontend stores the token and includes it in subsequent API requests.
4. Protected routes check for valid authentication before serving content.

## Notification System

The notification system supports multiple channels:

1. **SMS Notifications**: Integrated with Twilio for delivering time-sensitive alerts.
2. **In-App Notifications**: Real-time updates displayed within the application.
3. **Email Notifications**: (Future implementation) For digest reports and security alerts.

## Bot Simulation System

The Bot Simulation System provides automated testing and performance validation through simulated user interactions:

1. **Bot Framework**: Hierarchical system of bot types with customizable personalities and behaviors.
2. **API Client Integration**: Custom API client framework for interacting with backend endpoints.
3. **Action Engine**: Library of bot actions ranging from simple operations to complex multi-step workflows.
4. **Monitoring Dashboard**: Real-time visualization of bot activities and system performance.
5. **Orchestration System**: Controls for managing bot swarms and coordination of testing scenarios.

Key bot types include:

- **Trader Bots**: Focused on marketplace transactions and token exchanges
- **Hodler Bots**: Simulate long-term holding patterns with occasional transactions
- **Node Operator Bots**: Deploy, maintain, and optimize node infrastructure
- **Developer Bots**: Test API integrations and smart contract deployments
- **Explorer Bots**: Broadly interact with multiple areas of the ecosystem

The simulation system provides valuable insights into:

- Platform performance under various load conditions
- Security vulnerabilities through automated testing
- User experience optimization opportunities
- Economic model validation through simulated market behaviors

For comprehensive details, see [BOT-SIMULATION-SYSTEM.md](./BOT-SIMULATION-SYSTEM.md).

## Development Tools & Scripts

- **backup.sh**: Creates a comprehensive backup of code, configuration, and database.
- **reinit.sh**: Resets the development environment cleanly.
- **db-migrate.sh**: Manages database schema migrations.
- **env-manager.sh**: Helper for managing environment variables.
- **script_runner.sh**: Unified interface for running various project scripts.
- **npm-scripts.sh**: Additional npm script functionality.

## Workflow

The standard development workflow follows these steps:

1. Run the development server with `npm run dev` or `./script_runner.sh run`.
2. Start the API Gateway with `./start-api-gateway.sh`.
3. Make code changes in the appropriate directories.
4. Test functionality locally through the API Gateway.
5. Create a backup with `./backup.sh` before major changes.
6. When database schema changes are needed, update `shared/schema.ts` and run migrations with `./db-migrate.sh`.

## Deployment

The application is configured for deployment on Replit with an integrated workflow system that handles:

1. Building the frontend and backend
2. Serving the application on a unified port
3. Managing environment variables and secrets

## Configuration

Configuration is managed through environment variables defined in the `.env` file (based on `.env.example`). Key configurations include:

1. Database connection details
2. API Gateway settings (ports, trusted IPs)
3. Twilio SMS credentials
4. Session secrets and security settings
5. Feature flags for optional functionality