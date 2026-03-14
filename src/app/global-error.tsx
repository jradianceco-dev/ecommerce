"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
    // Could send to error tracking service (Sentry, Datadog, etc.)
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
            padding: "40px",
            backgroundColor: "#f9fafb",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "500px",
              padding: "40px",
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "4rem",
                marginBottom: "20px",
              }}
            >
              😕
            </div>
            <h1
              style={{
                fontSize: "2rem",
                color: "#111827",
                marginBottom: "12px",
                fontWeight: "900",
              }}
            >
              Oops! Something went wrong
            </h1>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              We're sorry for the inconvenience. Our team has been notified and
              we're working on it.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 32px",
                backgroundColor: "#D4AF37",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "700",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#B8941F")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#D4AF37")
              }
            >
              Try again
            </button>
            <p
              style={{
                marginTop: "24px",
                fontSize: "0.875rem",
                color: "#9ca3af",
              }}
            >
              If the problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
