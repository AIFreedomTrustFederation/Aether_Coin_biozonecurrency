import React from 'react';
import { ContextualHelp } from './feature-tooltip';
import { 
  Shield, 
  Key, 
  Wallet, 
  Clock, 
  Sparkles, 
  Brain, 
  Layers, 
  Database,
  Network,
  Cpu,
  Lock,
  FileText,
  PenTool,
  Scale
} from 'lucide-react';

/**
 * A collection of pre-defined contextual help tooltips for common
 * blockchain and cryptocurrency related features in the application.
 */

export const SeedPhraseTooltip = () => (
  <ContextualHelp
    title="Seed Phrase Security"
    description={
      <div className="space-y-2">
        <p>A seed phrase (or recovery phrase) is a sequence of words that can recover your wallet if lost.</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Write it down physically, never digitally</li>
          <li>Store in a secure location like a safe</li>
          <li>Never share with anyone</li>
        </ul>
      </div>
    }
    icon={<Shield className="h-4 w-4 text-primary" />}
    side="right"
  />
);

export const PassphraseTooltip = () => (
  <ContextualHelp
    title="Your Wallet Passphrase"
    description={
      <div className="space-y-2">
        <p>Your passphrase encrypts your wallet data and is required for transactions. Unlike your seed phrase, you'll use this regularly.</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Use a strong, unique passphrase</li>
          <li>Must be at least 8 characters</li>
          <li>Include numbers and special characters</li>
        </ul>
      </div>
    }
    icon={<Key className="h-4 w-4 text-primary" />}
    side="right"
  />
);

export const QuantumResistanceTooltip = () => (
  <ContextualHelp
    title="Quantum Resistance"
    description="Our blockchain uses post-quantum cryptography algorithms like CRYSTAL-Kyber and SPHINCS+ that can withstand attacks from quantum computers, protecting your assets well into the future."
    icon={<Shield className="h-4 w-4 text-primary" />}
  />
);

export const FractalShardingTooltip = () => (
  <ContextualHelp
    title="Fractal Sharding"
    description="Fractal sharding is our innovative approach that breaks data into recursive patterns for storage and validation, improving scalability while maintaining security through mathematical self-similarity properties."
    icon={<Layers className="h-4 w-4 text-primary" />}
  />
);

export const GasFeesTooltip = () => (
  <ContextualHelp
    title="Gas Fees Explained"
    description={
      <div className="space-y-2">
        <p>Gas fees are the transaction costs on the blockchain:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Base Fee: Set by network demand</li>
          <li>Priority Fee: Optional tip to miners</li>
          <li>Gas Limit: Maximum gas you're willing to use</li>
        </ul>
        <p className="text-xs">Higher fees typically result in faster transactions.</p>
      </div>
    }
    icon={<Cpu className="h-4 w-4 text-primary" />}
    side="bottom"
  />
);

export const MysterionNetworkTooltip = () => (
  <ContextualHelp
    title="Mysterion AI Network"
    description="The Mysterion Network is our distributed AI training system where users contribute processing power to train AI models collectively. You earn ICON tokens for your contributions while helping build a decentralized AI infrastructure."
    icon={<Brain className="h-4 w-4 text-primary" />}
    side="left"
  />
);

export const MultiCoinWalletTooltip = () => (
  <ContextualHelp
    title="Multi-Coin Wallet"
    description="Your Aetherion wallet supports all ecosystem tokens (SING, FTC, ICON, WIN) in a single interface. This simplifies management while keeping assets secure using unique derivation paths for each currency."
    icon={<Wallet className="h-4 w-4 text-primary" />}
  />
);

export const TransactionConfirmationTooltip = () => (
  <ContextualHelp
    title="Transaction Confirmations"
    description={
      <div className="space-y-2">
        <p>Confirmations indicate how many blocks have been added to the blockchain since your transaction was included.</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>1-2 confirmations: Transaction included</li>
          <li>3-5 confirmations: Reasonably secure</li>
          <li>6+ confirmations: Highly secure</li>
        </ul>
      </div>
    }
    icon={<Clock className="h-4 w-4 text-primary" />}
    side="bottom"
  />
);

export const MiningRewardsTooltip = () => (
  <ContextualHelp
    title="Mining Rewards"
    description="Mining rewards are earned for validating transactions and securing the network. Rewards include new coins (block rewards) and transaction fees. Rewards vary by network and depend on your contribution, hardware, and network difficulty."
    icon={<Database className="h-4 w-4 text-primary" />}
  />
);

export const SmartContractTooltip = () => (
  <ContextualHelp
    title="Smart Contracts"
    description="Smart contracts are self-executing agreements with the terms written in code. They automatically enforce and execute terms when conditions are met, enabling trustless transactions and complex decentralized applications."
    icon={<FileText className="h-4 w-4 text-primary" />}
  />
);

export const GovernanceTooltip = () => (
  <ContextualHelp
    title="Blockchain Governance"
    description="Governance is how the blockchain community makes decisions about protocol upgrades and changes. WINNation token holders can propose and vote on changes, creating a decentralized decision-making process."
    icon={<Scale className="h-4 w-4 text-primary" />}
    side="left"
  />
);

export const ICOParticipationTooltip = () => (
  <ContextualHelp
    title="ICO Participation"
    description={
      <div className="space-y-2">
        <p>Initial Coin Offerings (ICOs) let you purchase tokens for new projects before they're widely available.</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Research the project thoroughly</li>
          <li>Review team credentials and roadmap</li>
          <li>Understand token utility and distribution</li>
          <li>Be aware of lockup periods</li>
        </ul>
      </div>
    }
    icon={<Sparkles className="h-4 w-4 text-primary" />}
    side="right"
  />
);

export const NodeOperationTooltip = () => (
  <ContextualHelp
    title="Running a Node"
    description="Running a node helps decentralize and secure the network. Nodes store blockchain data, validate transactions, and relay information. Full nodes require dedicated hardware and reliable internet connection, while light nodes have reduced requirements."
    icon={<Network className="h-4 w-4 text-primary" />}
    side="bottom"
  />
);

export const PrivateKeyTooltip = () => (
  <ContextualHelp
    title="Private Key Security"
    description="Your private key is the cryptographic key that proves ownership of your wallet and authorizes transactions. Never share it with anyone, store it securely, and consider hardware wallets for maximum security."
    icon={<Lock className="h-4 w-4 text-primary" />}
    side="right"
  />
);