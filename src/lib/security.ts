import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitizes plain text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .trim()
    .substring(0, 255); // Align with database schema limits
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates phone number format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Rate limiting helper for client-side throttling
 */
export class ClientRateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  check(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Detects potential bot behavior
 */
export function detectBotBehavior(formData: any): boolean {
  // Check if honeypot field is filled
  if (formData.honeypot) {
    return true;
  }

  // Check if form was filled too quickly (less than 3 seconds)
  if (formData.fillTime && formData.fillTime < 3000) {
    return true;
  }

  return false;
}

/**
 * Generates a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

/**
 * Validates CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length > 0;
}