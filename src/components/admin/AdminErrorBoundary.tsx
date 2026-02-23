/**
 * Admin Error Boundary Component
 * 
 * Catches JavaScript errors in admin page components and displays a fallback UI.
 * Prevents entire app from crashing when a single component fails.
 * 
 * Usage:
 * ```tsx
 * <AdminErrorBoundary fallback={<CustomFallback />}>
 *   <AllOtherComponent />
 * </AdminErrorBoundary>
 * ```
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AdminErrorBoundary caught an error:", error, errorInfo);
    
    // Log to error tracking service (e.g., Sentry) in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with error tracking service
      // sendToErrorTrackingService(error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default admin error UI
      return (
        <div className="min-h-screen bg-radiance-creamBackgroundColor flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We encountered an error while loading this page. Don't worry, our team has been notified.
            </p>

            {process.env.NODE_ENV === "development" && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <Bug size={16} className="text-red-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-red-800 overflow-auto max-h-32">
                    <code>{error.toString()}</code>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center gap-2 bg-radiance-goldColor text-white px-6 py-3 rounded-xl font-medium hover:bg-radiance-charcoalTextColor transition-colors"
              >
                <RefreshCw size={18} />
                Retry
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors text-gray-700"
              >
                Go Back
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Error ID: {typeof window !== "undefined" ? Date.now().toString(36) : "N/A"}
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default AdminErrorBoundary;
