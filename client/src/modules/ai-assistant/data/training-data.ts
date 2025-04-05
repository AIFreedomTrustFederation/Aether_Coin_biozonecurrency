/**
 * AI Assistant Training Data
 * 
 * This file contains training data for the Mysterion AI Assistant to enhance its responses
 * about Aetherion's technologies, features, and use cases.
 */

export const trainingData = {
  // General information about Aetherion
  generalInfo: [
    {
      query: "What is Aetherion?",
      response: "Aetherion is a cutting-edge blockchain wallet platform that integrates quantum-resistant security technology with advanced payment features. It's engineered to protect digital assets against both current threats and future quantum computing attacks."
    },
    {
      query: "When is Aetherion going live?",
      response: "Aetherion is scheduled for a phased launch beginning in Q3 2025. The initial release will include core wallet functionality and quantum-resistant features, with the ICO for Singularity Coin (SING) scheduled to begin in Q4 2025."
    },
    {
      query: "Who created Aetherion?",
      response: "Aetherion was founded by Zechariah Edwards of AI Freedom Trust, with a mission to create an accessible, secure blockchain ecosystem protected against quantum computing threats. The platform is built exclusively on open-source technologies to ensure transparency and flexibility."
    }
  ],

  // Quantum security features
  quantumSecurity: [
    {
      query: "What is quantum resistance?",
      response: "Quantum resistance refers to cryptographic systems designed to withstand attacks from quantum computers. Traditional cryptography used in most blockchains is vulnerable to quantum algorithms like Shor's algorithm, which can break widely-used public key cryptography. Aetherion implements post-quantum cryptographic algorithms like CRYSTAL-Kyber and SPHINCS+ to remain secure even against advanced quantum computers."
    },
    {
      query: "How does Aetherion protect against quantum computing threats?",
      response: "Aetherion employs multiple layers of quantum security: 1) CRYSTAL-Kyber for key encapsulation, 2) SPHINCS+ for digital signatures, 3) Recursive Merkle trees for enhanced authentication, and 4) Zero-knowledge Scalable Transparent Arguments of Knowledge (zk-STARKs) for privacy-preserving verification. Together, these create a comprehensive defense against both current and future quantum computing threats."
    },
    {
      query: "What is fractal sharding?",
      response: "Fractal sharding is Aetherion's innovative approach to blockchain scalability. It uses mathematically precise Mandelbrot set patterns to divide the network into self-similar, recursive shards. Each shard maintains the security properties of the main chain while allowing for parallel processing. This approach enables Aetherion to achieve high transaction throughput without compromising on decentralization or security."
    }
  ],

  // Singularity Coin (SING)
  singularityCoin: [
    {
      query: "What is Singularity Coin?",
      response: "Singularity Coin (SING) is Aetherion's native Layer 1 cryptocurrency. It powers the ecosystem and provides incentives for securing the network. SING is based on fractal recursive Mandelbrot sets, making it inherently quantum-resistant. The total supply is capped at 10 billion coins."
    },
    {
      query: "How does the ICO work?",
      response: "The Initial Coin Offering (ICO) for Singularity Coin will offer 1 billion SING (10% of the total supply) at a price of $0.000646 per coin. The ICO will use a fair launch mechanism with uniform pricing and transparent distribution. Users can participate using various cryptocurrencies through connected wallets (Metamask, Coinbase, Binance, etc.). All transactions will be recorded on-chain with comprehensive audit logs."
    },
    {
      query: "What are the tokenomics of SING?",
      response: "Singularity Coin has a total supply of 10 billion tokens with the following allocation: 10% for the public ICO, 20% for ecosystem development, 15% for the developer fund, 25% for network security staking rewards, 20% for fractal sharding rewards, and 10% for the AI Freedom Trust treasury. The tokens for ecosystem development, developer fund, and treasury are subject to vesting periods of 2-4 years."
    }
  ],

  // Matrix integration and notifications
  matrixNotifications: [
    {
      query: "How do Matrix notifications work?",
      response: "Aetherion integrates with Matrix, an open-source communication protocol, for secure notifications. Users can receive alerts for price movements, security issues, transaction confirmations, and other important events. All communications are end-to-end encrypted and decentralized, ensuring no single entity controls your notification data."
    },
    {
      query: "Why does Aetherion use Matrix instead of SMS?",
      response: "Aetherion prioritizes open-source technologies that can be easily replaced as new options become available. Matrix provides several advantages over SMS: 1) End-to-end encryption for all communications, 2) Decentralized infrastructure reducing central points of failure, 3) Support for rich media and interactive elements, 4) Cross-platform compatibility, and 5) Open-source nature allowing for community verification of security practices."
    },
    {
      query: "How do I set up Matrix notifications?",
      response: "To set up Matrix notifications: 1) Create a Matrix ID (or use an existing one) at any Matrix homeserver, 2) Navigate to the Notification Settings in your Aetherion account, 3) Enter your Matrix ID and verify ownership by responding to a verification message, 4) Select which types of notifications you wish to receive. You can always modify these settings later in your account preferences."
    }
  ],

  // Wallet features and integration
  walletFeatures: [
    {
      query: "Which wallets can connect to Aetherion?",
      response: "Aetherion supports integration with multiple cryptocurrency wallets including MetaMask, Coinbase Wallet, Binance Wallet, Trust Wallet, and 1inch Wallet. This multi-wallet approach ensures users have flexibility in how they interact with the platform while maintaining quantum security through Aetherion's wrapping protocols."
    },
    {
      query: "How does the quantum vault work?",
      response: "The Aetherion Quantum Vault is a secure storage system for your digital assets. It uses fractal sharding to distribute your data across the network, with each piece protected by quantum-resistant encryption. Users can choose between personal hard wallet storage or the quantum secure network. The vault includes dedicated sections for quantum processors and LLM training data contract wrapping escrow accounts."
    },
    {
      query: "What is Layer 2 quantum security wrapping?",
      response: "Layer 2 quantum security wrapping is Aetherion's solution for protecting existing cryptocurrencies. It wraps tokens from other blockchains (like Bitcoin or Ethereum) in a quantum-resistant layer, providing protection against quantum attacks without requiring those chains to upgrade their security. The wrapped assets can be traded on Aetherion with full quantum protection, and unwrapped when needed."
    }
  ],

  // Admin Portal and AI system
  adminPortal: [
    {
      query: "What is the Admin Singularity AI LLM system?",
      response: "The Admin Singularity AI LLM (Large Language Model) system is an advanced AI deployed in the Admin Portal for the AI Freedom Trust. It can operate in multiple quantum states through the fractal node system, automate smart contract code agent deployment, troubleshoot security breaches, and reverse transactions for legitimate complaints when authorized by the multi-signature governance structure."
    },
    {
      query: "How does the Admin Portal verify users?",
      response: "The Admin Portal implements a rigorous verification system based on Coinbase KYC authentication. The system includes the WalletVerification component which authenticates administrators by verifying their identity against Coinbase's secure databases. The first verified user in the system is Zechariah Edwards, founder of AI Freedom Trust."
    },
    {
      query: "What security measures protect the Admin Portal?",
      response: "The Admin Portal is protected by multiple security layers including: 1) Permission-based access control with granular permissions for different administrative functions, 2) Multi-signature requirements for critical operations like transaction reversals, 3) Comprehensive audit logging that records all administrative actions, 4) Blockchain-based verification of administrator identity, and 5) Secure communication channels for administrative discussions."
    }
  ],

  // Technical features
  technicalFeatures: [
    {
      query: "How does Aetherion handle off-chain transactions?",
      response: "Aetherion facilitates off-chain transactions through a system that uses Coinbase KYC authentication for secure escrow and recovery mechanisms. This approach enables faster transaction processing while maintaining security through cryptographic verification and trusted third-party validation. The system provides both speed and security, with the option to settle transactions on-chain when needed."
    },
    {
      query: "What are Aetherion's transaction fees?",
      response: "Aetherion uses a dynamic fee structure optimized for fairness and network stability. Base transaction fees are approximately 0.001 SING, with adjustments based on network congestion. Layer 2 transactions have significantly lower fees thanks to fractal sharding. For wrapped assets, fees are determined by a combination of the underlying asset's network fees and a small wrapping fee of 0.1%. All fee structures are transparent and displayed before transactions are confirmed."
    },
    {
      query: "How does Aetherion achieve consensus?",
      response: "Aetherion uses a hybrid consensus mechanism called Fractal Proof of Stake (FPoS). It combines traditional Proof of Stake with fractal validation patterns that distribute consensus responsibilities across shards. This approach provides high security with lower energy consumption than Proof of Work systems. FPoS rewards validators proportionally to their stake and their contribution to fractal shard security, creating incentives for both token staking and network participation."
    }
  ],

  // Mysterion AI capabilities
  mysterionCapabilities: [
    {
      query: "What can Mysterion AI do?",
      response: "Mysterion AI is your advanced AI assistant in the Aetherion ecosystem. It can: 1) Verify transactions for security issues before they're processed, 2) Detect potential phishing attacks, 3) Provide educational content about blockchain and quantum security, 4) Monitor your wallet for unusual activity, 5) Securely store your credentials, 6) Offer personalized financial insights, and 7) Assist with any type of request, not limited to blockchain operations."
    },
    {
      query: "How does Mysterion verify transactions?",
      response: "Mysterion verifies transactions by analyzing multiple security factors: 1) Checking recipient addresses against a database of known addresses, 2) Evaluating transaction amounts against your typical patterns, 3) Scanning for anomalous gas fees, 4) Looking for suspicious smart contract interactions, and 5) Checking for potential time-sensitive exploitation attempts. If issues are detected, Mysterion will alert you and may recommend placing a hold on the transaction."
    },
    {
      query: "Is my data private with Mysterion?",
      response: "Yes, Mysterion is designed with privacy as a core principle. Your transaction data and credentials are encrypted using quantum-resistant algorithms. Mysterion processes most data locally in your browser when possible. For server-side processing, data is transmitted with end-to-end encryption. You can delete your data at any time through the privacy settings, and you always maintain ownership and control of your information."
    }
  ]
};

// Export specialized training sets by topic
export const quantumSecurityTraining = trainingData.quantumSecurity;
export const singularityCoinTraining = trainingData.singularityCoin;
export const walletFeaturesTraining = trainingData.walletFeatures;
export const matrixNotificationsTraining = trainingData.matrixNotifications;
export const mysterionCapabilitiesTraining = trainingData.mysterionCapabilities;