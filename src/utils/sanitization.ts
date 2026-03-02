/**
 * Input Sanitization Utilities
 * 
 * Prevents XSS attacks and SQL injection
 * Use on all user inputs before storing/displaying
 */

/**
 * Sanitize text input
 * - Removes HTML tags
 * - Trims whitespace
 * - Limits length
 * - Escapes special characters
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  const withoutHtml = input.replace(/<[^>]*>/g, '');
  
  // Trim and limit length
  const trimmed = withoutHtml.trim().slice(0, maxLength);
  
  // Escape special characters
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize rich text (allows safe HTML tags)
 * Use for product descriptions, reviews, etc.
 */
export function sanitizeRichText(input: string, maxLength: number = 5000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Allow only safe tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'blockquote', 'code'];
  const tagRegex = new RegExp(`</?(?!(${allowedTags.join('|')})\\b)[a-z][a-z0-9]*[^>]*>`, 'gi');
  
  // Remove disallowed tags
  const sanitized = input.replace(tagRegex, '');
  
  // Limit length
  return sanitized.slice(0, maxLength);
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  return email.trim().toLowerCase().slice(0, 255);
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  const trimmed = url.trim().slice(0, 2048);
  
  // Only allow http and https
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize number (prevent injection via number fields)
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  const num = Number(input);
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  if (min !== undefined && num < min) {
    return min;
  }
  
  if (max !== undefined && num > max) {
    return max;
  }
  
  return num;
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData(formData: Record<string, any>, schema: Record<string, {
  type: 'text' | 'email' | 'url' | 'number' | 'richText';
  maxLength?: number;
  min?: number;
  max?: number;
}>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(formData)) {
    const config = schema[key];
    
    if (!config) {
      // Skip unknown fields
      continue;
    }
    
    switch (config.type) {
      case 'text':
        sanitized[key] = sanitizeInput(value, config.maxLength);
        break;
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'url':
        sanitized[key] = sanitizeUrl(value);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value, config.min, config.max);
        break;
      case 'richText':
        sanitized[key] = sanitizeRichText(value, config.maxLength);
        break;
    }
  }
  
  return sanitized;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data: Record<string, any>, required: string[]): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  for (const field of required) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = `${field} is required`;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
