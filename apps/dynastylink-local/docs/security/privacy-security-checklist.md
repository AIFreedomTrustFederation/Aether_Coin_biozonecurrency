# DynastyLink Privacy and Security Checklist

## Local-Only Core
- Confirm the core app runs without external API calls.
- Confirm no external analytics, tracking pixels, telemetry, or CDN dependencies are required.
- Confirm uploads remain in local storage or approved self-hosted storage.

## Authentication
- Use strong password hashing.
- Store only password hashes, never plaintext passwords.
- Use secure cookies in production behind HTTPS.
- Add CSRF protection before public deployment.
- Add account recovery only if it can be implemented without insecure email assumptions.

## Data Protection
- Separate user records by authenticated user ID.
- Prevent users from reading another user's trust profile, vault files, beneficiaries, roles, or assets.
- Add audit logging for sensitive operations.
- Encrypt sensitive vault files at rest before production.
- Back up the database and vault files securely.

## Trust Vault
- Validate file sizes.
- Validate allowed file extensions/MIME types before production.
- Scan files locally before public deployment.
- Store original filenames separately from internal storage filenames.
- Never expose raw filesystem paths to users.

## AI Safety
- Use only local AI in the core app.
- Log model prompts and outputs locally for admin review.
- Refuse legal, tax, investment, insurance, or financial advice.
- Route binding decisions to professional review.

## Deployment
- Run behind HTTPS.
- Set secure cookie flags in production.
- Use environment variables for secrets.
- Do not commit runtime databases, vault uploads, or private keys.
- Review Docker and server logs for accidental sensitive information.
