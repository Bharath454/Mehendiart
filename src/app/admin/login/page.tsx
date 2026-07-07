"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Sparkles, Loader2, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Successful login - secure cookie was set by the API
      router.push("/admin/dashboard");
      router.refresh(); // Refresh page data/auth state
      
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mehendi-bg relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-henna-pattern">
      <div className="absolute inset-0 pattern-overlay opacity-25" />
      
      {/* Decorative vectors */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-mehendi-gold/5 blur-3xl" />
      <div className="absolute bottom-[10%] right-[10%] w-64 h-64 rounded-full bg-mehendi-dark/5 blur-3xl" />

      {/* Return home anchor */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center space-x-1.5 text-xs text-mehendi-olive hover:text-mehendi-gold transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Homepage</span>
      </Link>

      <div className="max-w-md w-full relative z-10">
        
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-mehendi-dark/10 border border-mehendi-gold/20 mb-3 animate-pulse">
            <Sparkles className="h-6 w-6 text-mehendi-gold" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-mehendi-darker tracking-wide">
            Chennai Mehendi Art
          </h2>
          <p className="text-xs text-mehendi-olive font-light tracking-widest uppercase mt-1">
            Artist Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-mehendi-gold/25 shadow-2xl p-8 sm:p-10 relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-mehendi-dark via-mehendi-gold to-mehendi-olive" />
          
          <h3 className="text-lg font-serif font-bold text-mehendi-darker mb-6 border-b border-mehendi-gold/10 pb-3">
            Secure Admin Sign In
          </h3>

          {error && (
            <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded mb-5 font-light leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-mehendi-gold" />
                <span>Username</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
                <Lock className="h-3.5 w-3.5 text-mehendi-gold" />
                <span>Password</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm"
              />
            </div>

            {/* Notice block */}
            <div className="bg-mehendi-bg/40 border border-mehendi-gold/10 rounded-xl p-3 text-[10px] text-mehendi-olive/80 font-light leading-relaxed">
              <strong>Tip:</strong> The default workspace credentials are username <code className="font-mono font-bold bg-white px-1 py-0.5 rounded">admin</code> and password <code className="font-mono font-bold bg-white px-1 py-0.5 rounded">admin123</code>.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-mehendi-dark to-mehendi-olive hover:opacity-95 text-mehendi-cream font-medium px-5 py-3.5 rounded-xl shadow-lg border border-mehendi-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 text-mehendi-gold animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>

        </div>

        {/* Footer info links */}
        <p className="text-center text-[10px] text-mehendi-olive/60 mt-8 font-light">
          Secured with JWT and HTTP-Only Session Cookies.<br />
          © Chennai Mehendi Art.
        </p>

      </div>
    </div>
  );
}
