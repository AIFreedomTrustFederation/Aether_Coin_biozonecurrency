# API Security Guidelines

This document outlines the security guidelines for handling API keys and other sensitive credentials in this project.

## General Guidelines

1. **NEVER commit API keys to Git**
   - API keys should only be stored in the `.env` file, which is excluded from Git via `.gitignore`
   - Use `.env.example` to document which environment variables are needed, but with placeholder values

2. **Use environment variables for all API keys**
   - All API keys should be loaded from environment variables
   - Never hardcode API keys in source code

3. **Mask API keys in logs**
   - When logging, always mask API keys (e.g., `sk-L9gY***Xxpj`)
   - Use the `apiKeyManager.maskKey()` utility function for this purpose

4. **Limit API key access**
   - Only services that need a specific API key should have access to it
   - Use the `apiKeyManager` utility to centralize key management

## Setting Up API Keys

1. Copy `.env.example` to `.env` (which is gitignored):
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your actual API keys:
   ```
   BRAINTRUST_API_KEY=your_actual_braintrust_key
   MISTRAL_API_KEY=your_actual_mistral_key
   ```

3. For additional security, you can set an encryption key:
   ```
   API_KEY_ENCRYPTION_KEY=a_random_secure_string
   ```

## Running Evaluations Securely

### Using the PowerShell Script

```powershell
# Run with keys from .env file
.\scripts\run-ai-evaluation.ps1

# Run with keys provided directly (not recommended for shared environments)
.\scripts\run-ai-evaluation.ps1 -BraintrustApiKey "your_key" -MistralApiKey "your_key"
```

### Using npm Scripts

```bash
# Make sure your .env file is set up first
npm run eval:ai
```

## Security Best Practices

1. **Rotate API keys regularly**
   - Periodically generate new API keys and update your `.env` file
   - Revoke old API keys after rotation

2. **Use the minimum required permissions**
   - When generating API keys, use the principle of least privilege
   - Only grant the permissions that are absolutely necessary

3. **Monitor API key usage**
   - Regularly check API usage logs for unusual activity
   - Set up alerts for unexpected usage patterns

4. **Secure your development environment**
   - Use full disk encryption
   - Keep your operating system and development tools updated
   - Use a password manager for storing API keys when not in use

5. **Consider using a secrets manager**
   - For production environments, consider using a dedicated secrets manager
   - Options include AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault

## What to Do If a Key Is Compromised

1. **Revoke the key immediately**
   - Log in to the service provider and revoke/delete the compromised key

2. **Generate a new key**
   - Create a new API key with the same permissions

3. **Update your .env file**
   - Replace the compromised key with the new one

4. **Check for unauthorized usage**
   - Review logs and billing information for any unauthorized usage

5. **Investigate the cause**
   - Determine how the key was compromised to prevent future incidents