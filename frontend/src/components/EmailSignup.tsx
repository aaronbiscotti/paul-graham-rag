"use client";

import { useState } from "react";

interface EmailSignupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailSignup({ isOpen, onClose }: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/email-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to sign up. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail("");
      }, 2000);
    } catch (error) {
      console.error("Email signup error:", error);
      setError("Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="email-signup-modal">
        <button onClick={onClose} className="modal-close">
          ×
        </button>

        {success ? (
          <div className="success-state">
            <h2>Thanks for signing up!</h2>
            <p>You&apos;ll be the first to know about new projects.</p>
          </div>
        ) : (
          <>
            <h2>99% of startups fail</h2>
            <p>
              I&apos;m analyzing failed startups weekly and sharing what went
              wrong. Drop your email and I&apos;ll send you a case study each
              week!
            </p>

            <form onSubmit={handleSubmit}>
              <div className="email-field">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="email-input"
                />
              </div>

              {error && <div className="signup-error">{error}</div>}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="signup-submit"
              >
                {loading ? "Signing up..." : "Get Weekly Insights"}
              </button>
            </form>

            <div className="signup-info">
              <p>Be the outlier.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
