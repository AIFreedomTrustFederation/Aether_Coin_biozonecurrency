# Aetherion Blockchain Wallet

A cutting-edge blockchain wallet platform that delivers a secure and engaging cryptocurrency management experience. The application combines advanced security protocols with intuitive, modern design principles to simplify complex blockchain interactions.

![Aetherion Logo](https://via.placeholder.com/150?text=Aetherion)

## Features

- Secure quantum-resistant blockchain wallet management
- Real-time transaction tracking and notifications
- Multiple notification channels:
  - SMS alerts for critical security and transaction events
  - Open-source Matrix protocol integration for secure notifications
- Advanced portfolio analytics and visualization
- Smart contract deployment and interaction
- Security health scoring for wallet safety
- Multi-layer authentication system
- Mobile-first responsive design
- AI Assistant with:
  - Conversational interface for wallet management
  - Secure credential storage with AES-256 encryption
  - Transaction verification and risk assessment
  - Voice command support for hands-free operation
- Transaction Security:
  - Real-time phishing detection and prevention
  - Address reputation checking
  - Customizable security rules
  - Transaction risk scoring
- Escrow System:
  - Configurable holding periods for transactions
  - Dispute resolution mechanism
  - Conditional release based on custom rules
  - Transaction reversal within holding period

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookie handling
- **Notifications**:
  - SMS: Twilio API integration
  - Open-source: Matrix protocol (matrix-js-sdk)
- **Security**: 
  - Quantum-resistant API validation layer
  - AES-256 encryption for sensitive data
  - Real-time phishing detection
- **AI Integration**:
  - Natural language processing for chat interface
  - Voice recognition and command processing
  - Transaction risk analysis using AI models
- **Escrow System**:
  - Transaction holding mechanisms
  - Smart-contract based conditional releases
  - Dispute resolution framework
- **Charts**: Recharts for data visualization
- **State Management**: React Query + Context
- **Routing**: Wouter for lightweight client-side routing
- **Decentralized Storage**:
  - IPFS/Filecoin via Web3.Storage
  - ENS domain integration
  - FractalCoin sharded storage network

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- For decentralized deployment (optional):
  - Web3.Storage account
  - Ethereum wallet for ENS domain (optional)
  - Filecoin API access (optional)
- For notifications (at least one of):
  - Twilio account for SMS notifications
  - Matrix homeserver access for open-source notifications

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

## Notification Systems

The application supports multiple notification channels for maximum flexibility and user choice:

### SMS Notifications

SMS notifications via Twilio send alerts to users for:

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

2. Ensure SMS notifications are enabled in the feature flags:
   ```
   ENABLE_SMS_NOTIFICATIONS=true
   ```

### Matrix Notifications (Open Source Alternative)

The application also integrates with Matrix, an open-source, decentralized communication protocol:

1. **Benefits of Matrix**:
   - Fully open-source and self-hostable
   - End-to-end encryption support
   - No dependence on proprietary services
   - Federated architecture for resilience

To configure Matrix notifications:

1. Add your Matrix server credentials to the `.env` file:
   ```
   MATRIX_SERVER_URL=https://matrix.org (or your self-hosted instance)
   MATRIX_USER_ID=@yourbotuser:matrix.org
   MATRIX_ACCESS_TOKEN=your_matrix_access_token
   ```

2. Enable Matrix notifications in the feature flags:
   ```
   ENABLE_MATRIX_NOTIFICATIONS=true
   ```

Users can manage their notification preferences for both channels in the Settings page of the application.

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

The application supports both traditional and decentralized deployment methods.

### Traditional Deployment

The application can be deployed to any Node.js hosting platform:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Decentralized Deployment (IPFS/Filecoin)

For censorship-resistant, decentralized deployment:

1. Configure environment variables in your `.env` file:
   ```
   # Web3.Storage (IPFS gateway)
   WEB3_STORAGE_TOKEN=your_web3_storage_token
   
   # ENS domain (optional)
   ENS_PRIVATE_KEY=your_ethereum_private_key
   ENS_DOMAIN=your_ens_domain.eth
   
   # FractalCoin-Filecoin integration (optional)
   SETUP_FILECOIN_INTEGRATION=true
   FRACTALCOIN_API_KEY=your_fractalcoin_api_key
   FRACTALCOIN_API_ENDPOINT=https://api.fractalcoin.network/v1
   ```

2. Run the deployment script:
   ```bash
   ./deploy-decentralized.sh
   ```

3. Access your deployment via:
   - IPFS Gateway: `https://<CID>.ipfs.dweb.link/`
   - ENS Domain: `https://<your-domain>.eth.limo/`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### GitHub Actions Automated Deployments

The repository includes GitHub Actions workflows for automating deployments:

1. Push to the `main` branch to deploy to staging
2. Manually trigger the production deployment from the Actions tab
3. Both workflows handle the IPFS/Filecoin integration automatically

See `.github/workflows/deploy.yml` for workflow configuration details.

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
- The Matrix.org team for their open-source communication protocol
- The matrix-js-sdk maintainers for their JavaScript SDK
- The crypto-js team for their cryptographic library
- The react-chatbot-kit contributors for the AI assistant framework
- The React Speech Recognition team for voice command capabilities
- The secure-web-storage team for their encrypted storage solution
- The DOMPurify team for their HTML sanitization library
- The react-markdown team for their Markdown rendering capabilities
- The Web3.Storage team for their IPFS/Filecoin storage service
- The ENS team for their decentralized naming system
- The Web3.Storage team for their IPFS/Filecoin storage service
- The ENS team for their decentralized naming system
