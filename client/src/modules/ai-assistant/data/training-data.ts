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
    },
    {
      query: "How can I get started with Aetherion?",
      response: "You can get started with Aetherion by accessing our interactive tutorial. Just click /tutorial in the chat or visit aetherion.com/tutorial to begin a guided tour of all our features with voice explanations, interactive demos, and visual guides."
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
    },
    {
      query: "How can I earn SING coins?",
      response: "You can earn SING coins through several methods: 1) Mining through AI training by contributing processing power to train Mysterion, 2) Staking existing SING in liquidity pools to earn transaction fees, 3) Participating in the fractal validation network to earn validator rewards, 4) Contributing storage space to the decentralized storage network, or 5) Creating and hosting websites and applications on the Aetherion network. Each method has different reward structures and requirements which you can explore in the Earnings Dashboard."
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
    },
    {
      query: "How do I train Mysterion AI?",
      response: "You can train Mysterion AI by enabling the training feature in your settings. When enabled, Mysterion will learn from your interactions to better assist you. This training happens in three ways: 1) Direct feedback you provide after receiving responses, 2) Pattern recognition from your transaction history (with your permission), and 3) Contributing processing power through the distributed Mysterion Network. You'll earn SING coins for your training contributions, with the amount based on processing time and data quality."
    },
    {
      query: "I want to start the interactive tutorial",
      response: "I'm launching the interactive tutorial for you now. This guided tour will walk you through all Aetherion features with voice narration and interactive demonstrations. You can pause at any time by saying 'pause' or clicking the pause button. To access the tutorial later, just type '/tutorial' in our chat or visit aetherion.com/tutorial."
    }
  ],
  
  // Recurve Fractal Reserve
  recurveFractalReserve: [
    {
      query: "What is the Recurve Fractal Reserve?",
      response: "The Recurve Fractal Reserve is Aetherion's innovative financial system that enables users to back cryptocurrency tokens with real-world assets through insurance policies. It implements a mathematical model based on recursive Mandelbrot patterns that creates a self-reinforcing stability mechanism. This system allows for secure, non-recourse loans that maintain value stability even during market volatility."
    },
    {
      query: "How do I use the Recurve Fractal Reserve?",
      response: "To use the Recurve Fractal Reserve: 1) First connect an insurance policy to your Aetherion account (supports whole life and indexed universal life policies), 2) Mint Recurve Tokens backed by your policy's cash value at your chosen collateralization ratio, 3) Use your Recurve Tokens for staking, liquidity pools, or secure them in the Torus Security Field. You can also take fractalized loans against your token holdings without risking your original policy."
    },
    {
      query: "What is a Fractal Loan?",
      response: "A Fractal Loan is a unique financial instrument in Aetherion's Recurve system that allows you to borrow against your insurance policy's value without surrendering the policy or risking liquidation. These loans use recursive mathematics to create multiple collateralization layers that reinforce each other. The loans are non-recourse (meaning your original policy remains protected) and offer favorable tax treatment since they're backed by insurance policies rather than direct cryptocurrency holdings."
    },
    {
      query: "What's the difference between Recurve Tokens and FractalCoin?",
      response: "Recurve Tokens are asset-backed tokens minted against insurance policies in the Recurve Fractal Reserve system. They represent a claim on real-world financial assets. FractalCoin (FTC) is a utility token that powers the network's storage allocation, domain hosting, and computational resources. Recurve Tokens are designed for stability and financial applications, while FractalCoin is designed for utility across network services."
    },
    {
      query: "What is a Torus Security Node?",
      response: "A Torus Security Node is a specialized security structure in the Recurve Fractal Reserve that provides enhanced protection for your assets. These nodes use 4D torus mathematics to create self-reinforcing security patterns across the network. By staking your Recurve Tokens in a Torus Node, you contribute to network security while earning rewards. Each node operates at different security levels (primary, secondary, or tertiary) with varying reward structures based on the node's position in the torus field."
    },
    {
      query: "How does the Mandelbrot recursion affect my funds?",
      response: "Mandelbrot recursion is the mathematical principle behind the Recurve system that enables your funds to maintain stability through fractal patterns. The system calculates recursive iterations at specified depths (typically 3-7 levels deep) to create self-similar protective barriers against volatility. This recursion allows for higher capital efficiency and lower risk, since each recursion level provides additional protection for the underlying assets while maintaining the ability to use those assets productively in the ecosystem."
    }
  ],
  
  // Staking and Liquidity Pools
  stakingAndLiquidity: [
    {
      query: "How do liquidity pools work in Aetherion?",
      response: "Aetherion's liquidity pools allow users to stake their tokens in paired trading pools to facilitate decentralized trading. When you provide liquidity, you deposit equal values of two tokens (like SING/ETH or FTC/USDC) and receive LP tokens representing your share of the pool. You earn fees from trades executed through that pool, typically 0.3% of trade volume distributed proportionally to liquidity providers. The system uses a constant product formula (x*y=k) to determine exchange rates."
    },
    {
      query: "Can I stake ICON coins in liquidity pools?",
      response: "Yes, you can stake ICON coins in Aetherion's liquidity pools. ICON tokens can be paired with SING, FTC, or stablecoins in various pools. To stake your ICON: 1) Navigate to the Liquidity section in your dashboard, 2) Select 'Add Liquidity' and choose the ICON/PAIR pool you prefer, 3) Deposit equal values of both tokens, and 4) Confirm the transaction to receive your LP tokens. You'll immediately start earning trading fees from the pool."
    },
    {
      query: "What are the risks of providing liquidity?",
      response: "The main risks of providing liquidity in Aetherion pools include: 1) Impermanent Loss - if token prices change significantly from when you deposited, you might have less value than if you'd simply held the tokens, 2) Smart Contract Risk - though all contracts are audited, technical vulnerabilities are always a possibility, 3) Market Risk - extreme market conditions could impact liquidity pools. Aetherion mitigates these risks through quantum-secure contracts, automatic rebalancing mechanisms, and the unique Torus security structure that provides additional protection for liquidity providers."
    },
    {
      query: "What's the difference between staking and providing liquidity?",
      response: "In Aetherion, staking refers to locking up tokens (like SING or FTC) to support network security and validation in return for rewards. This is a single-asset process with relatively stable returns. Providing liquidity involves depositing pairs of tokens into trading pools to facilitate decentralized trading, earning fees from trades. Liquidity provision typically offers higher potential returns but comes with additional risks like impermanent loss. Staking rewards are inflation-based while liquidity rewards come directly from user trading activity."
    },
    {
      query: "What are the current staking rewards for SING coins?",
      response: "Current staking rewards for SING coins range from 7-12% APY depending on the staking period and amount staked. Short-term flexible staking (7-day lockup) offers approximately 7% APY, while longer commitments (90+ days) can earn up to 12% APY. Additionally, Trust members receive a 2% bonus on all staking rewards. These rates adjust dynamically based on network participation - as more tokens are staked, the reward rate gradually decreases to maintain economic balance. You can view current exact rates in the Staking Dashboard."
    },
    {
      query: "How do I start staking?",
      response: "To start staking on Aetherion: 1) Go to the Staking section of your dashboard, 2) Select the token you wish to stake (SING, FTC, ICON, etc.), 3) Choose the staking period that matches your goals (longer periods offer higher rewards), 4) Specify the amount to stake, 5) Review the estimated rewards and terms, and 6) Confirm the transaction. Your staking position will be activated immediately, and you'll begin earning rewards which are distributed daily to your wallet or can be automatically re-staked for compound returns."
    }
  ],
  
  // FractalCoin and Storage Allocation
  fractalCoinAndStorage: [
    {
      query: "What is FractalCoin?",
      response: "FractalCoin (FTC) is Aetherion's utility token that powers the network's decentralized storage and computational resources. It implements a fractal self-similar structure that enables efficient scaling of storage systems. FTC rewards users who contribute storage space, computational resources, or domain hosting services to the network. It works alongside SING coin but focuses specifically on storage and computational utility rather than general governance and value transfer."
    },
    {
      query: "How do I earn FractalCoin through storage allocation?",
      response: "To earn FractalCoin through storage allocation: 1) Navigate to the Resource Allocation section in your dashboard, 2) Specify how much storage space you want to contribute (minimum 50GB), 3) Run the diagnostic test to verify your connection speed and uptime capability, 4) Set your availability preferences (higher availability = higher rewards), and 5) Start your node. You'll earn FTC based on the amount of space provided, your uptime, and the actual storage utilized. Rewards are distributed daily and can be tracked in real-time in your dashboard."
    },
    {
      query: "What are the hardware requirements for storage allocation?",
      response: "The minimum hardware requirements for FractalCoin storage allocation are: 50GB of available storage space, 5Mbps upload speed, 10Mbps download speed, and the ability to keep your node online for at least 20 hours per day on average. Higher specifications will qualify you for premium rewards: 500GB+ storage with 50Mbps+ connection speeds and 23+ hours of daily uptime can earn up to 2.5x the base reward rate. The system automatically adjusts rewards based on your actual performance metrics."
    },
    {
      query: "How is FractalCoin different from Filecoin?",
      response: "FractalCoin differs from Filecoin in several key ways: 1) It implements a fractal sharding approach for more efficient storage distribution, 2) It has a two-way integration with Filecoin for broader storage compatibility, 3) It combines storage with computational resources for AI training and quantum validation, 4) It focuses specifically on domain hosting and web infrastructure rather than general file storage, and 5) It uses quantum-resistant encryption for all stored data. FractalCoin is designed to complement Filecoin's ecosystem while adding specialized functionality for the Aetherion network."
    },
    {
      query: "How does the Filecoin integration work?",
      response: "Aetherion's FractalCoin has a two-way bridge with Filecoin that allows for seamless interoperability between the networks. When you contribute storage to Aetherion, your resources can optionally be made available to the broader Filecoin network, expanding your earning potential. Similarly, Filecoin storage providers can offer space to Aetherion users through our bridge protocol. The system automatically routes storage requests to the most efficient location based on speed, redundancy requirements, and cost considerations. This integration creates a unified storage ecosystem while maintaining the unique benefits of each network."
    },
    {
      query: "Can I monitor my storage allocation performance?",
      response: "Yes, you can monitor your storage allocation performance in detail through the Trust Portal's Resource Dashboard. This shows real-time metrics including: 1) Current space utilized vs. total contribution, 2) Uptime percentage, 3) Network performance metrics, 4) FTC earnings per day/week/month, 5) Files currently being stored (anonymized for privacy), and 6) Predictive earnings based on current performance. The dashboard also provides alerts if your node's performance drops below optimal levels and suggestions for improving your contribution efficiency."
    }
  ],
  
  // Domain Hosting and Web Integration
  domainHosting: [
    {
      query: "What is domain hosting on Aetherion?",
      response: "Domain hosting on Aetherion allows you to create and deploy websites on the decentralized FractalCoin network. Unlike traditional centralized hosting, Aetherion's domain hosting distributes your site across multiple nodes using fractal sharding for superior uptime, censorship resistance, and performance. You can register .trust domains native to the Aetherion ecosystem or connect traditional domains like .com or .org. Sites can range from simple static websites to complex web applications with database functionality."
    },
    {
      query: "How do I register a .trust domain?",
      response: "To register a .trust domain: 1) Go to the Domain section in your dashboard, 2) Enter your desired domain name (e.g., yoursite.trust), 3) Check availability and select your registration period (1-10 years), 4) Complete the registration by paying with SING or FTC tokens. .Trust domains are uniquely integrated with the blockchain, allowing for ownership verification, transparent history, and additional features like decentralized DNS resolution and instant global propagation. Once registered, you can immediately begin building your site using our hosting tools."
    },
    {
      query: "Can I use traditional domains with Aetherion hosting?",
      response: "Yes, you can use traditional domains (.com, .org, etc.) with Aetherion's decentralized hosting. After purchasing your domain from a standard registrar, connect it to Aetherion by: 1) Adding our nameservers to your domain configuration, or 2) Creating specific DNS records pointing to your Aetherion site. The system will then distribute your site across the fractal network while maintaining compatibility with the traditional DNS infrastructure. This gives you the benefits of decentralized hosting while keeping compatibility with standard web browsers and services."
    },
    {
      query: "How does the domain hosting wizard work?",
      response: "The domain hosting wizard guides you through setting up your website in four simple steps: 1) Domain Selection - choose your existing domain or register a new one, 2) Resource Allocation - select storage capacity, computational resources, and redundancy level with visual feedback on costs, 3) Content Deployment - upload your website files or use our AI-powered website generator to create a site from your description, and 4) Settings Configuration - customize performance settings, security options, and integration features. Throughout the process, you'll see real-time resource allocation feedback and cost estimates. The wizard makes professional web hosting accessible even to non-technical users."
    },
    {
      query: "Tell me about the AI Website Generator",
      response: "The AI Website Generator allows you to create complete, professional websites by simply describing what you want in plain language. Just provide a detailed description of your desired site (purpose, style, content needs), and the AI will generate a fully functional website including design, layout, placeholder content, and basic functionality. You can then refine the site through further conversation with the AI or manual editing. The generator uses open-source models and seamlessly deploys to the Aetherion network. This feature makes web development accessible to everyone, regardless of technical expertise."
    },
    {
      query: "How do I monitor my hosted domains?",
      response: "You can monitor your hosted domains through the Trust Portal's Domain Dashboard, which provides comprehensive analytics including: 1) Visitor statistics and geographic distribution, 2) Resource usage metrics (bandwidth, storage, computation), 3) Performance data (load times, availability percentage), 4) Security alerts and access logs, and 5) Cost breakdown and efficiency metrics. The dashboard also offers tools for scaling resources during traffic spikes, implementing advanced security measures, and optimizing performance. Real-time alerts can be configured to notify you of any issues requiring attention."
    }
  ],
  
  // Trust Portal and Network Monitoring
  trustPortalAndMonitoring: [
    {
      query: "What is the Trust Portal?",
      response: "The Trust Portal is Aetherion's comprehensive dashboard for monitoring and managing all your network activities. It provides a unified interface for tracking your assets, resource contributions, rewards, domain hosting, and network status. As a trust member, you gain additional capabilities like governance participation, advanced analytics, and network health monitoring. The portal implements real-time data visualization using advanced fractal patterns to represent complex network relationships and resource allocations in an intuitive format."
    },
    {
      query: "How do I monitor my network activities?",
      response: "You can monitor all your network activities through the Trust Portal, which offers several specialized dashboards: 1) Asset Dashboard for tracking cryptocurrencies and Recurve tokens, 2) Resource Dashboard for monitoring storage and computational contributions, 3) Domain Dashboard for website hosting analytics, 4) Earnings Dashboard for all revenue streams and rewards, and 5) Network Dashboard for overall system health and performance. Each dashboard provides real-time data, historical trends, and predictive analytics to help you optimize your participation in the Aetherion ecosystem."
    },
    {
      query: "What metrics are available in the Network Status section?",
      response: "The Network Status section provides comprehensive metrics on the Aetherion ecosystem, including: 1) Total active nodes and their geographic distribution, 2) Current network throughput and capacity (transactions per second), 3) Storage utilization and availability across the network, 4) Computational resource allocation for AI training and validation, 5) Token staking and liquidity statistics, 6) Recent governance proposals and voting status, 7) Security metrics and threat assessments, and 8) Global Mandelbrot stability index. These metrics are updated in real-time and can be viewed in both summary and detailed formats."
    },
    {
      query: "How does the resource visualization work?",
      response: "The resource visualization in the Trust Portal uses innovative fractal visualization techniques to represent complex data relationships. Storage allocations are displayed as recursive Mandelbrot patterns where larger contributions create more elaborate fractal structures. Computational resources appear as animated Julia sets that pulse with activity during processing. Network connections form Sierpinski triangles showing node relationships. These visualizations aren't just aesthetic - they're functional tools that allow you to intuitively grasp complex system relationships and identify optimization opportunities through pattern recognition."
    },
    {
      query: "How can I track my earnings across different activities?",
      response: "The Earnings Dashboard in the Trust Portal consolidates all your revenue streams into one comprehensive view. It tracks earnings from: 1) SING staking rewards, 2) FractalCoin storage allocation rewards, 3) Mysterion AI training compensation, 4) Transaction validation rewards, 5) Liquidity pool fees, 6) Domain hosting revenues, and 7) Fractal loan interest (if you're a lender). The dashboard shows daily, weekly, and monthly earnings with detailed breakdowns, historical trends, and projections. You can also set earnings goals and receive optimization suggestions to maximize your returns."
    },
    {
      query: "What security monitoring is available?",
      response: "The Trust Portal includes comprehensive security monitoring through the Security Dashboard, which provides: 1) Real-time threat detection and alerts for your assets and resources, 2) Quantum security status of your wallets and transactions, 3) Torus Field integrity monitoring for your Recurve tokens, 4) Access logs for all your accounts and domains, 5) Anomaly detection using AI pattern recognition, and 6) Network-wide security bulletins and updates. The system uses fractal analysis to detect unusual patterns that might indicate security threats before they materialize, giving you proactive protection against emerging risks."
    }
  ],
  
  // SING Mining and AI Training
  singMiningAndAiTraining: [
    {
      query: "How does SING coin mining work?",
      response: "SING coin mining in Aetherion is fundamentally different from traditional cryptocurrency mining. Instead of solving arbitrary cryptographic puzzles, you earn SING by contributing computational resources to train and improve the Mysterion AI network. Your computer processes training data segments, validates model performance, and contributes to distributed parameter optimization. This approach creates a valuable real-world output (improved AI) rather than expending energy on abstract proofs, making it both more efficient and more purposeful than traditional mining."
    },
    {
      query: "How do I start mining SING through AI training?",
      response: "To start mining SING through AI training: 1) Go to the Mining section in your dashboard, 2) Download and install the Mysterion Training Client for your operating system, 3) Set your resource allocation preferences (CPU, GPU, and memory dedication), 4) Configure your training schedule (when your device is available for training), and 5) Start the client. The system will automatically assign appropriate training tasks based on your hardware capabilities. You'll earn SING based on the complexity of tasks completed, quality of results, and total processing time contributed."
    },
    {
      query: "What hardware do I need for effective AI training mining?",
      response: "While any modern computer can participate in SING mining through AI training, different hardware is optimal for different tasks: 1) For basic training tasks: any multi-core CPU with 8GB+ RAM, 2) For intermediate tasks: recent CPUs (AMD Ryzen/Intel i5 or better) with 16GB+ RAM, 3) For advanced training: a dedicated GPU with 6GB+ VRAM (NVIDIA GTX 1660 or better). The mining system automatically assigns tasks appropriate to your hardware, so everyone can participate regardless of their setup. More powerful systems earn proportionally higher rewards, but the system is designed to be accessible to average computers."
    },
    {
      query: "How much can I earn through SING mining?",
      response: "Earnings from SING mining vary based on your hardware, commitment time, and current network needs. As a general guideline: 1) Entry-level systems (standard multi-core CPU) earn approximately 5-10 SING per day with 8 hours of contribution, 2) Mid-range systems (good CPU + basic GPU) earn about 15-30 SING daily, 3) High-performance systems (powerful GPU or multiple GPUs) can earn 50-100+ SING daily. These rates adjust based on network participation - as more miners join, individual rewards decrease gradually to maintain economic balance. The exact current rates are always visible in the Mining Dashboard."
    },
    {
      query: "What is the Mysterion Network?",
      response: "The Mysterion Network is Aetherion's distributed AI training system where users collectively train, validate and improve the Mysterion AI assistant. Instead of running on centralized servers owned by a corporation, Mysterion's intelligence is developed across thousands of user devices in a genuinely decentralized architecture. This approach ensures no single entity controls the AI, creates censorship resistance, and distributes the economic value of AI back to users rather than corporations. The network uses advanced federated learning techniques to maintain privacy while enabling collaborative learning."
    },
    {
      query: "How is my privacy protected during AI training?",
      response: "Your privacy during AI training is protected through several mechanisms: 1) Federated Learning - your device processes data locally without raw data leaving your system, 2) Differential Privacy - training contributions add mathematical noise to prevent identification of individual inputs, 3) Zero-Knowledge Proofs - verify contributions without revealing underlying data, 4) Homomorphic Encryption - perform computations on encrypted data without decryption, and 5) Opt-in Controls - granular settings for what types of data your device will process. These protections ensure you can contribute to the network without compromising your personal information or processing sensitive content."
    }
  ],
  
  // Interactive Tutorial System
  tutorialSystem: [
    {
      query: "How do I start the interactive tutorial?",
      response: "You can start the interactive tutorial in several ways: 1) Type '/tutorial' in your chat with me, 2) Click the 'Interactive Tutorial' button in the main navigation menu, 3) Visit aetherion.com/tutorial directly, or 4) Ask me to 'start the interactive tutorial' and I'll launch it for you immediately. The tutorial will open in a dedicated interface with voice narration, interactive demonstrations, and step-by-step guidance through all of Aetherion's features."
    },
    {
      query: "What does the interactive tutorial cover?",
      response: "The interactive tutorial covers all major aspects of the Aetherion platform in a modular format. Core modules include: 1) Getting Started with Wallet Setup, 2) Understanding Quantum Security, 3) SING and FractalCoin Basics, 4) Mining and Resource Contribution, 5) Recurve Fractal Reserve System, 6) Domain Hosting and Web Integration, 7) Staking and Liquidity Provision, and 8) Advanced Features for Trust Members. Each module takes 5-10 minutes to complete, and you can choose which sections to explore based on your interests and experience level."
    },
    {
      query: "Can I pause or skip parts of the tutorial?",
      response: "Yes, the interactive tutorial is completely flexible. You can pause at any time by clicking the pause button or saying 'pause' if voice control is enabled. You can skip to specific sections using the tutorial navigation menu, and you can exit and return later with your progress saved. The tutorial adapts to your knowledge level - if you complete advanced actions successfully, it will automatically skip related basic instructions. You can also adjust the pace, disable voice narration, or enable detailed technical explanations through the settings panel."
    },
    {
      query: "/tutorial",
      response: "I'm launching the interactive tutorial for you now. This guided tour will walk you through all Aetherion features with voice narration and interactive demonstrations. You can pause at any time by saying 'pause' or clicking the pause button. The tutorial will open in a new interface where you'll be able to explore all platform features in a guided, hands-on environment."
    },
    {
      query: "Start interactive tutorial",
      response: "I'm launching the interactive tutorial for you now. This guided tour will walk you through all Aetherion features with voice narration and interactive demonstrations. You can pause at any time by saying 'pause' or clicking the pause button. The tutorial will open in a new interface where you'll be able to explore all platform features in a guided, hands-on environment."
    },
    {
      query: "Can I get help with specific features?",
      response: "Yes, you can access context-specific tutorials for any feature by clicking the help icon (question mark) next to that feature in the interface. This will launch a targeted mini-tutorial focused specifically on that element. Alternatively, you can ask me directly about any feature, and I can either explain it conversationally or launch the relevant tutorial section. For Trust members, we also offer scheduled one-on-one guidance sessions with our specialized support team."
    }
  ]
};

// Export specialized training sets by topic
export const quantumSecurityTraining = trainingData.quantumSecurity;
export const singularityCoinTraining = trainingData.singularityCoin;
export const walletFeaturesTraining = trainingData.walletFeatures;
export const matrixNotificationsTraining = trainingData.matrixNotifications;
export const mysterionCapabilitiesTraining = trainingData.mysterionCapabilities;
export const recurveFractalReserveTraining = trainingData.recurveFractalReserve;
export const stakingAndLiquidityTraining = trainingData.stakingAndLiquidity;
export const fractalCoinAndStorageTraining = trainingData.fractalCoinAndStorage;
export const domainHostingTraining = trainingData.domainHosting;
export const trustPortalAndMonitoringTraining = trainingData.trustPortalAndMonitoring;
export const singMiningAndAiTrainingTraining = trainingData.singMiningAndAiTraining;
export const tutorialSystemTraining = trainingData.tutorialSystem;