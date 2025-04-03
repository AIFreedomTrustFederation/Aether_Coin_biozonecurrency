import { Request, Response, NextFunction } from 'express';

/**
 * Gateway Validation Middleware
 * 
 * This middleware ensures that all API requests come through the authenticated API Gateway
 * with proper quantum-resistant validation headers. This adds an extra layer of security
 * to protect against direct API attacks.
 */
export function gatewayValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check for API Gateway validation headers
  const gatewayValidated = req.headers['x-api-gateway-validated'];
  const quantumTimestamp = req.headers['x-quantum-validation-timestamp'];
  
  // Get list of trusted API Gateway IPs from environment
  const trustedGatewayIPs = process.env.TRUSTED_GATEWAY_IPS?.split(',') || ['127.0.0.1', '::1', 'localhost'];
  
  // Extract client IP
  const clientIP = req.ip || req.socket.remoteAddress || '';
  
  // For development, allow localhost without validation
  if (process.env.NODE_ENV === 'development' && (clientIP.includes('127.0.0.1') || clientIP.includes('::1'))) {
    console.log(`[Gateway Validation] Development request from ${clientIP}, allowing without gateway validation`);
    return next();
  }
  
  // Check if request is from a trusted API Gateway
  const isTrustedGateway = trustedGatewayIPs.some(ip => clientIP.includes(ip));
  
  // Validate gateway headers
  if (!gatewayValidated || gatewayValidated !== 'true') {
    console.warn(`[Gateway Validation] Request blocked: Missing gateway validation header. IP: ${clientIP}`);
    return res.status(403).json({
      error: 'Access Denied',
      message: 'API requests must be routed through the API Gateway.'
    });
  }
  
  if (!quantumTimestamp) {
    console.warn(`[Gateway Validation] Request blocked: Missing quantum timestamp. IP: ${clientIP}`);
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Invalid request signature.'
    });
  }
  
  if (!isTrustedGateway) {
    console.warn(`[Gateway Validation] Request blocked: Untrusted gateway IP: ${clientIP}`);
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Request not from authorized gateway.'
    });
  }
  
  // Timestamp validation (prevent replay attacks)
  const timestamp = parseInt(quantumTimestamp as string, 10);
  const currentTime = Date.now();
  const timeDifference = currentTime - timestamp;
  
  // Reject timestamps older than 2 minutes (potential replay attack)
  if (isNaN(timestamp) || timeDifference > 2 * 60 * 1000) {
    console.warn(`[Gateway Validation] Request blocked: Expired or invalid timestamp. Difference: ${timeDifference}ms`);
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Request timestamp expired or invalid.'
    });
  }
  
  // All validation checks passed
  console.log(`[Gateway Validation] Request from ${clientIP} successfully validated`);
  next();
}