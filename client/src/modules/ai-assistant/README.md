# AI Assistant Module

## Overview

The AI Assistant module provides an intelligent conversational interface for the Aetherion blockchain wallet platform. It offers transaction verification, phishing detection, credential storage, and transaction reversal capabilities within a secure, quantum-resistant environment.

## Key Features

- **Conversational Interface**: A chat-based UI for natural interaction with the AI assistant
- **Transaction Verification**: Analyze transactions for potential risks before execution
- **Phishing Detection**: Identify and warn about potential phishing attempts
- **Secure Credential Storage**: Encrypted storage for sensitive wallet credentials
- **Transaction Reversal**: Ability to reverse fraudulent transactions within a holding period
- **Voice Commands**: Optional voice interaction for hands-free operation
- **Multi-level Security**: Configurable security levels from standard to paranoid

## Components

- `AIAssistant`: Main component that integrates all assistant features
- `ChatInterface`: UI component for interacting with the assistant
- `SecureStorage`: Utility for encrypted credential storage
- `TransactionVerifier`: Transaction analysis and risk assessment tool

## Usage

```jsx
import { AIAssistant, AIProvider } from '@/modules/ai-assistant';

// Wrap your app in the provider
function MyApp() {
  return (
    <AIProvider>
      <AppContent />
    </AIProvider>
  );
}

// Use the assistant in a component
function WalletDashboard() {
  return (
    <div>
      <h1>My Wallet Dashboard</h1>
      <AIAssistant userId={1} />
    </div>
  );
}
```

## Configuration

The AI Assistant can be configured with the following settings:

- `userId`: Required user identifier for personalization
- `theme`: UI theme (light, dark, system)
- `enableVoice`: Enable/disable voice commands
- `enableNotifications`: Enable/disable assistant notifications
- `securityLevel`: Security level (standard, high, paranoid)
- `language`: Preferred language
- `transactionReversal`: Enable/disable transaction reversal
- `holdingPeriod`: Holding period for reversals in hours

## Hooks

- `useAI()`: Access assistant state and methods
- `useAIContext()`: Simplified interface for common assistant operations

## Integration with Other Modules

The AI Assistant integrates with:

- **Transaction Security Module**: For transaction risk analysis
- **Escrow Module**: For holding transactions during the reversibility period
- **Notification Module**: For alerting users about important events

## API Interface

The assistant interacts with backend services via API endpoints for:

- Transaction verification
- Phishing detection
- Credential management
- Transaction reversal

All communication is secured through the quantum-resistant validation layer.