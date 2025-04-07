# Aetherion Deployment Guide

This document provides comprehensive deployment instructions for the Aetherion blockchain wallet platform, covering both traditional centralized hosting and decentralized deployment options.

## Table of Contents

1. [Traditional Deployment](#traditional-deployment)
   - [Prerequisites](#traditional-prerequisites)
   - [Deployment Steps](#traditional-deployment-steps)
   - [Environment Variables](#traditional-environment-variables)
   
2. [Decentralized Deployment](#decentralized-deployment)
   - [Prerequisites](#decentralized-prerequisites)
   - [IPFS/Filecoin Setup](#ipfs-filecoin-setup)
   - [ENS Domain Integration](#ens-domain-integration)
   - [FractalCoin Storage Integration](#fractalcoin-storage-integration)
   - [Deployment Steps](#decentralized-deployment-steps)
   - [Environment Variables](#decentralized-environment-variables)
   
3. [GitHub Actions CI/CD](#github-actions-cicd)
   - [Workflow Configuration](#workflow-configuration)
   - [Secret Management](#secret-management)
   
4. [Post-Deployment Verification](#post-deployment-verification)
   - [Health Checks](#health-checks)
   - [Security Verification](#security-verification)

5. [Troubleshooting](#troubleshooting)


---

## Traditional Deployment

### Prerequisites

- Node.js (v18.x or higher) and npm (v9.x or higher)
- PostgreSQL database
- SMTP server for email notifications (optional)
- Twilio account for SMS notifications (optional)
- Stripe account for payment processing (optional)

### Deployment Steps

1. Clone the repository
2. Install dependencies
3. Set up environment variables by creating a `.env` file based on `.env.example`
4. Build the application
5. Run database migrations
6. Run the deploy-to-domain.js script to generate deployment configurations
7. Follow the instructions in the generated deployment guides

The application can be accessed via two endpoints:
- Primary endpoint: `https://atc.aifreedomtrust.com/app` (recommended)
- Secondary endpoint: `https://atc.aifreedomtrust.com/wallet` (legacy support)

### Environment Variables

- Database configuration
- Server settings
- Authentication secrets
- Optional integrations (email, SMS, payment processing)

## Decentralized Deployment

### Prerequisites

- Node.js (v18.x or higher) and npm (v9.x or higher)
- Web3.Storage account and API token
- Ethereum wallet with private key (for ENS domain integration)
- ENS domain (optional)
- FractalCoin API access (optional)

### IPFS/Filecoin Setup

1. Create an account on Web3.Storage
2. Generate an API token from the Web3.Storage dashboard
3. Add the token to your environment variables

### ENS Domain Integration

1. Register an ENS domain
2. Set up a wallet with ETH for gas fees
3. Prepare your Ethereum private key for automated deployments
4. Configure CONTENTHASH record to point to your IPFS CID

### FractalCoin Storage Integration

The Aetherion platform includes a custom sharded storage network called FractalCoin that integrates with Filecoin. This allows:

1. Filecoin miners to become storage nodes for the FractalCoin network
2. Bidirectional data storage between networks
3. Cost offset and revenue generation opportunities

### Deployment Steps

1. Clone the repository
2. Install dependencies
3. Set up environment variables for decentralized deployment
4. Build the application
5. Run the deploy-decentralized.sh script
6. Access your application via IPFS gateways or ENS domain

### Environment Variables

- Web3.Storage token
- ENS configuration (optional)
- FractalCoin integration settings (optional)

## GitHub Actions CI/CD

### Workflow Configuration

The repository includes GitHub Actions workflows for automated deployments:

1. Staging Deployment - Triggered on push to the main branch
2. Production Deployment - Manually triggered from the Actions tab

### Secret Management

Store deployment secrets securely in GitHub repository settings

## Post-Deployment Verification

### Health Checks

Verify all components are functioning correctly after deployment

### Security Verification

Ensure security best practices are applied to the deployed application

## Troubleshooting

Common issues and their solutions for both traditional and decentralized deployment scenarios

