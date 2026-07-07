"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, Sparkles, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

type AuthMode = "user-signin" | "user-signup" | "admin-signin";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("user-signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (mode === "user-signup" && !name) {
      setError("Please fill in your name.");
      return;
    }
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "user-signup") {
        // Register User
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed.");

        setSuccessMsg(data.message || "Registration successful! You can now log in.");
        setMode("user-signin");
        setPassword("");
      } else {
        // Login Admin or User
        const role = mode === "admin-signin" ? "admin" : "user";
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Authentication failed.");

        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-mehendi-bg">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-30 inline-flex items-center space-x-1.5 text-xs text-white sm:text-mehendi-olive hover:text-mehendi-gold transition-colors font-medium bg-black/30 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-full"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return Home</span>
      </Link>

      {/* Left side: Premium Mehendi Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-mehendi-darker overflow-hidden">
        <img
          src="/api/local-image?name=bridal3"
          alt="Chennai Mehendi Art Design"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-[10000ms] hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-mehendi-darker via-mehendi-darker/60 to-transparent" />
        
        <div className="relative z-10 p-16 flex flex-col justify-end h-full text-white">
          <div className="inline-flex p-3 rounded-full bg-mehendi-gold/15 border border-mehendi-gold/30 mb-6 w-fit">
            <Sparkles className="h-6 w-6 text-mehendi-gold" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide leading-tight mb-4">
            Chennai Mehendi Art
          </h1>
          <p className="text-mehendi-cream/80 font-light text-sm max-w-md leading-relaxed">
            Beautiful, long-lasting premium organic mehendi designs crafted to elevate the joy of your special wedding ceremonies.
          </p>
        </div>
      </div>

      {/* Right side: Login Forms Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-henna-pattern">
        <div className="absolute inset-0 pattern-overlay opacity-10" />

        <div className="max-w-md w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden inline-flex p-3 rounded-full bg-mehendi-dark/10 border border-mehendi-gold/20 mb-3">
              <Sparkles className="h-6 w-6 text-mehendi-gold" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-mehendi-darker tracking-wide">
              {mode === "user-signin" && "Welcome Back"}
              {mode === "user-signup" && "Create Account"}
              {mode === "admin-signin" && "Artist Portal"}
            </h2>
            <p className="text-xs text-mehendi-olive font-light tracking-wide mt-1.5">
              {mode === "user-signin" && "Sign in to schedule your bookings"}
              {mode === "user-signup" && "Join us to manage appointment reviews"}
              {mode === "admin-signin" && "Authorized Admin Access Only"}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-mehendi-gold/15 mb-6">
            <button
              onClick={() => { setMode("user-signin"); setError(""); }}
              className={`py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                mode === "user-signin" ? "bg-mehendi-dark text-white" : "text-mehendi-darker/60 hover:text-mehendi-dark"
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => { setMode("user-signup"); setError(""); }}
              className={`py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                mode === "user-signup" ? "bg-mehendi-dark text-white" : "text-mehendi-darker/60 hover:text-mehendi-dark"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode("admin-signin"); setError(""); }}
              className={`py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                mode === "admin-signin" ? "bg-mehendi-gold text-mehendi-darker" : "text-mehendi-darker/60 hover:text-mehendi-dark"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl border border-mehendi-gold/25 shadow-xl p-6 sm:p-10 relative">
            {error && (
              <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-xl mb-5 font-light">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs rounded-xl mb-5 font-light flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Name (Only in Sign Up Mode) */}
              {mode === "user-signup" && (
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="auth-name" className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-mehendi-gold" />
                    <span>Full Name</span>
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyal Sharma"
                    className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm bg-white"
                  />
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="auth-email" className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
                  <Mail className="h-3.5 w-3.5 text-mehendi-gold" />
                  <span>Email Address</span>
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === "admin-signin" ? "shahirabanu1706@gmail.com" : "name@domain.com"}
                  className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm bg-white"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="auth-password" className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
                  <Lock className="h-3.5 w-3.5 text-mehendi-gold" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mehendi-olive/50 hover:text-mehendi-gold transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full inline-flex items-center justify-center space-x-2 text-white font-medium px-5 py-3.5 rounded-xl shadow-lg border border-mehendi-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none ${
                  mode === "admin-signin" ? "bg-gradient-to-r from-mehendi-gold to-mehendi-olive" : "bg-gradient-to-r from-mehendi-dark to-mehendi-olive"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 text-mehendi-gold animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {mode === "user-signin" && "Sign In"}
                    {mode === "user-signup" && "Create Account"}
                    {mode === "admin-signin" && "Admin Access"}
                  </span>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[10px] text-mehendi-olive/60 mt-8 font-light">
            © Chennai Mehendi Art. Secured Access.
          </p>
        </div>
      </div>
    </div>
  );
}
