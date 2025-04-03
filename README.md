# Aetherion Blockchain Wallet

A cutting-edge blockchain wallet platform that delivers a secure and engaging cryptocurrency management experience. The application combines advanced security protocols with intuitive, modern design principles to simplify complex blockchain interactions.

![Aetherion Logo](https://via.placeholder.com/150?text=Aetherion)

## Features

- Secure quantum-resistant blockchain wallet management
- Real-time transaction tracking and notifications
- SMS alerts for critical security and transaction events
- Advanced portfolio analytics and visualization
- Smart contract deployment and interaction
- Security health scoring for wallet safety
- Multi-layer authentication system
- Mobile-first responsive design

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookie handling
- **SMS Notifications**: Twilio API integration
- **Charts**: Recharts for data visualization
- **State Management**: React Query + Context
- **Routing**: Wouter for lightweight client-side routing

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Twilio account for SMS notifications

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aetherion-wallet.git
   cd aetherion-wallet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration values
   ```

4. Push database schema:
   ```bash
   npm run db:push
   # or use the script
   ./db-migrate.sh
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or use the script
   ./script_runner.sh run
   ```

6. Open your browser to http://localhost:3000

## Project Structure

The application follows a structured organization pattern to maintain clean separation of concerns:

```
├── client/       # Frontend React application
├── server/       # Backend Express server
├── shared/       # Shared code (types, schema)
```

For a more detailed breakdown of the project structure, see [STRUCTURE.md](./STRUCTURE.md).

## Development Tools

This project includes several helpful scripts to assist with development:

- **./script_runner.sh run**: Start the development server
- **./script_runner.sh db push**: Run database migrations
- **./script_runner.sh backup**: Create a full project backup
- **./script_runner.sh reset**: Reset project to a clean state
- **./env-manager.sh check**: Check for missing environment variables

## SMS Notification System

The application uses Twilio for sending SMS notifications to users for:

1. **Transaction Alerts**: Notify users of incoming/outgoing transactions
2. **Security Alerts**: Warn about suspicious activities or login attempts
3. **Price Alerts**: Inform users when cryptocurrencies reach specified price points
4. **Marketing Updates**: Optional promotional messages (user opt-in required)

To configure SMS notifications:

1. Add your Twilio credentials to the `.env` file:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   ```

2. Users can manage their notification preferences in the Settings page of the application.

## Database Management

The project uses Drizzle ORM with PostgreSQL. The schema is defined in `shared/schema.ts`.

To make changes to the database schema:

1. Update the schema definitions in `shared/schema.ts`
2. Run migrations with `./db-migrate.sh`

For database exploration, you can use Drizzle Studio:
```bash
npx drizzle-kit studio
```

## Deployment

The application is configured for deployment on Replit, but can be deployed to any Node.js hosting platform.

For production deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

We welcome contributions to the Aetherion Blockchain Wallet project! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of changes to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- The shadcn/ui team for their excellent component library
- The Drizzle ORM team for their TypeScript-first database toolkit
- The Twilio team for their reliable messaging API