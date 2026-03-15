/**
 * =============================================================================
 * Automated Error Tracking System
 * =============================================================================
 *
 * Global error tracking following best practices:
 * - Security errors (XSS, CSRF, auth failures)
 * - Functional errors (API failures, business logic)
 * - Non-functional errors (performance, UI glitches)
 *
 * Features:
 * - Auto-capture error context
 * - Categorize by type (Security/Functional/Non-Functional)
 * - Auto-log to issues table
 * - Optional: Send to external monitoring (Sentry, Datadog)
 */

import { createClient } from "@/utils/supabase/client";

export type ErrorCategory = "security" | "functional" | "non_functional";
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorContext {
  // Basic info
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  
  // Context
  url?: string;
  userAgent?: string;
  userId?: string;
  userEmail?: string;
  
  // Technical details
  componentName?: string;
  functionName?: string;
  errorCode?: string;
  
  // Metadata
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Categorize error by type
 */
export function categorizeError(error: Error | unknown): ErrorCategory {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : "";
  
  // Security errors
  const securityPatterns = [
    /unauthorized/i,
    /forbidden/i,
    /authentication/i,
    /csrf/i,
    /xss/i,
    /injection/i,
    /permission denied/i,
    /access denied/i,
    /invalid token/i,
    /session expired/i,
  ];
  
  if (securityPatterns.some(pattern => pattern.test(errorMessage) || pattern.test(errorStack || ""))) {
    return "security";
  }
  
  // Functional errors
  const functionalPatterns = [
    /failed to fetch/i,
    /network/i,
    /api/i,
    /database/i,
    /query/i,
    /validation/i,
    /not found/i,
    /timeout/i,
    /server error/i,
  ];
  
  if (functionalPatterns.some(pattern => pattern.test(errorMessage) || pattern.test(errorStack || ""))) {
    return "functional";
  }
  
  // Default to non-functional
  return "non_functional";
}

/**
 * Determine error severity
 */
export function determineSeverity(error: Error | unknown, category: ErrorCategory): ErrorSeverity {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Critical: Security breaches, data loss
  if (category === "security" && /injection|xss|csrf|breach/i.test(errorMessage)) {
    return "critical";
  }
  
  // High: Security issues, major functionality broken
  if (category === "security" || /critical|major|cannot proceed/i.test(errorMessage)) {
    return "high";
  }
  
  // Medium: Minor functionality issues
  if (/minor|warning|degraded/i.test(errorMessage)) {
    return "medium";
  }
  
  // Low: Cosmetic, non-blocking
  return "low";
}

/**
 * Capture error context
 */
export function captureErrorContext(error: Error | unknown, context?: Partial<ErrorContext>): ErrorContext {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  const category = categorizeError(error);
  const severity = determineSeverity(error, category);
  
  return {
    message: errorMessage,
    stack: errorStack,
    category,
    severity,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    ...context,
  };
}

/**
 * Log error to database (issues table)
 */
export async function logErrorToDatabase(errorContext: ErrorContext): Promise<void> {
  try {
    const supabase = createClient();
    
    // Format title
    const title = `[${errorContext.category.toUpperCase()}] ${errorContext.message.substring(0, 100)}`;
    
    // Format description with full context
    const description = `
**Error Details:**
${errorContext.message}

**Category:** ${errorContext.category}
**Severity:** ${errorContext.severity}
**Timestamp:** ${errorContext.timestamp}

**Stack Trace:**
\`\`\`
${errorContext.stack || "No stack trace available"}
\`\`\`

**Context:**
- URL: ${errorContext.url || "N/A"}
- User Agent: ${errorContext.userAgent || "N/A"}
- User ID: ${errorContext.userId || "N/A"}
- Component: ${errorContext.componentName || "N/A"}
- Function: ${errorContext.functionName || "N/A"}
- Error Code: ${errorContext.errorCode || "N/A"}

**Metadata:**
\`\`\`json
${JSON.stringify(errorContext.metadata || {}, null, 2)}
\`\`\`
    `.trim();
    
    // Insert into issues table
    const { error } = await supabase.from("issues").insert({
      type: "bug",
      title,
      description,
      priority: errorContext.severity === "critical" ? "critical" 
                : errorContext.severity === "high" ? "high" 
                : errorContext.severity === "medium" ? "medium" : "low",
      status: "reported",
      customer_email: errorContext.userEmail || null,
      metadata: errorContext,
    });
    
    if (error) {
      console.error("Failed to log error to database:", error);
    } else {
      console.log("Error logged to database:", title);
    }
  } catch (dbError) {
    console.error("Failed to log error:", dbError);
  }
}

/**
 * Global error handler - catches unhandled errors
 */
export function setupGlobalErrorHandler() {
  if (typeof window === "undefined") return;
  
  // Unhandled errors
  window.onerror = function(message, source, lineno, colno, error) {
    const errorContext = captureErrorContext(error || new Error(String(message)), {
      category: "functional",
      severity: "high",
      metadata: {
        source,
        lineno,
        colno,
      },
    });
    
    console.error("Global error caught:", errorContext);
    logErrorToDatabase(errorContext);
    
    // Don't prevent default error handling
    return false;
  };
  
  // Unhandled promise rejections
  window.onunhandledrejection = function(event) {
    const errorContext = captureErrorContext(event.reason, {
      category: "functional",
      severity: "high",
    });
    
    console.error("Unhandled promise rejection:", errorContext);
    logErrorToDatabase(errorContext);
  };
}

/**
 * Track error with custom context
 * Use this in try-catch blocks
 */
export async function trackError(
  error: Error | unknown,
  context?: Partial<ErrorContext>
): Promise<void> {
  const errorContext = captureErrorContext(error, context);
  console.error("Error tracked:", errorContext);
  await logErrorToDatabase(errorContext);
}

/**
 * Track security error specifically
 */
export async function trackSecurityError(
  error: Error | unknown,
  context?: Partial<ErrorContext>
): Promise<void> {
  const errorContext = captureErrorContext(error, {
    ...context,
    category: "security",
    severity: context?.severity || "high",
  });
  
  console.error("Security error tracked:", errorContext);
  await logErrorToDatabase(errorContext);
  
  // Optional: Send alert for critical security errors
  if (errorContext.severity === "critical") {
    // TODO: Send email/SMS alert to security team
    console.warn("CRITICAL SECURITY ERROR - Alert security team!");
  }
}

/**
 * Track functional error (API failures, etc.)
 */
export async function trackFunctionalError(
  error: Error | unknown,
  context?: Partial<ErrorContext>
): Promise<void> {
  const errorContext = captureErrorContext(error, {
    ...context,
    category: "functional",
  });
  
  console.error("Functional error tracked:", errorContext);
  await logErrorToDatabase(errorContext);
}

/**
 * Track non-functional error (performance, UI)
 */
export async function trackNonFunctionalError(
  error: Error | unknown,
  context?: Partial<ErrorContext>
): Promise<void> {
  const errorContext = captureErrorContext(error, {
    ...context,
    category: "non_functional",
    severity: context?.severity || "low",
  });
  
  console.error("Non-functional error tracked:", errorContext);
  await logErrorToDatabase(errorContext);
}

/**
 * Performance monitoring helper
 */
export function trackPerformance(
  metricName: string,
  value: number,
  threshold: number
): void {
  if (value > threshold) {
    const errorContext = captureErrorContext(new Error(`${metricName} exceeded threshold`), {
      category: "non_functional",
      severity: value > threshold * 2 ? "medium" : "low",
      metadata: {
        metric: metricName,
        value,
        threshold,
        unit: "ms",
      },
    });
    
    console.warn("Performance issue:", errorContext);
    logErrorToDatabase(errorContext);
  }
}
