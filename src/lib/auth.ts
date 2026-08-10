import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ─── JWT Secret ───────────────────────────────────────────────────────────────
// Throw hard at startup if missing — never silently fall back to a weak secret
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is not set. " +
      "Set a strong random secret in .env.local before running the app."
    );
  }
  if (secret.length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET key strength check failed. " +
      "Your JWT_SECRET must be at least 32 characters long to be secure."
    );
  }
  return secret;
}

// ─── Token Payloads ───────────────────────────────────────────────────────────
export interface AdminTokenPayload {
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export interface UserTokenPayload {
  id: string;
  email: string;
  name: string;
  role: "user";
  iat?: number;
  exp?: number;
}

export type TokenPayload = AdminTokenPayload | UserTokenPayload;

// ─── Error Types ─────────────────────────────────────────────────────────────
export class TokenExpiredError extends Error {
  constructor() {
    super("Token has expired");
    this.name = "TokenExpiredError";
  }
}

export class TokenInvalidError extends Error {
  constructor(message = "Invalid token") {
    super(message);
    this.name = "TokenInvalidError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// ─── Core Verification ────────────────────────────────────────────────────────
function verifyToken(token: string): TokenPayload {
  try {
    const secret = getJWTSecret();
    return jwt.verify(token, secret) as TokenPayload;
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") {
      throw new TokenExpiredError();
    }
    throw new TokenInvalidError(err?.message || "Token verification failed");
  }
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

/**
 * Verifies that the request has a valid admin_token cookie with role === "admin".
 * Returns the decoded payload on success.
 * Throws TokenExpiredError, TokenInvalidError, or UnauthorizedError.
 */
export async function requireAdmin(): Promise<AdminTokenPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    throw new UnauthorizedError("No admin token found");
  }

  const decoded = verifyToken(token);

  if (decoded.role !== "admin") {
    throw new UnauthorizedError("Access requires admin role");
  }

  return decoded as AdminTokenPayload;
}

/**
 * Non-throwing variant — returns null if admin is not authenticated.
 */
export async function getAdmin(): Promise<AdminTokenPayload | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

// ─── User Auth ────────────────────────────────────────────────────────────────

/**
 * Verifies that the request has a valid user_token cookie with role === "user".
 * Returns the decoded payload on success.
 * Throws TokenExpiredError, TokenInvalidError, or UnauthorizedError.
 */
export async function requireUser(): Promise<UserTokenPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;

  if (!token) {
    throw new UnauthorizedError("No user token found");
  }

  const decoded = verifyToken(token);

  if (decoded.role !== "user") {
    throw new UnauthorizedError("Access requires user role");
  }

  return decoded as UserTokenPayload;
}

/**
 * Non-throwing variant — returns null if user is not authenticated.
 */
export async function getUser(): Promise<UserTokenPayload | null> {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export interface RefreshTokenPayload {
  sub: string;       // "admin" or user ID
  role: "admin" | "user";
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies the refresh_token cookie.
 * Returns the decoded payload or null.
 */
export async function getRefreshToken(): Promise<RefreshTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refresh_token")?.value;
    if (!token) return null;

    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret) as RefreshTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

// ─── Token Generation Helpers ─────────────────────────────────────────────────

/**
 * Creates a short-lived access token (15 minutes).
 * Accepts admin or user payload.
 */
export function createAccessToken(
  payload: Omit<AdminTokenPayload, "iat" | "exp"> | Omit<UserTokenPayload, "iat" | "exp">
): string {
  const secret = getJWTSecret();
  return jwt.sign(payload as object, secret, { expiresIn: "15m" });
}

/**
 * Creates a long-lived refresh token (7 days).
 */
export function createRefreshToken(payload: Omit<RefreshTokenPayload, "iat" | "exp">): string {
  const secret = getJWTSecret();
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

// ─── Standard Error Response Helper ──────────────────────────────────────────
import { NextResponse } from "next/server";

export function authErrorResponse(err: unknown): NextResponse {
  if (err instanceof TokenExpiredError) {
    return NextResponse.json(
      { error: "Session expired. Please log in again.", code: "TOKEN_EXPIRED" },
      { status: 401 }
    );
  }
  if (err instanceof TokenInvalidError) {
    return NextResponse.json(
      { error: "Invalid session token.", code: "TOKEN_INVALID" },
      { status: 401 }
    );
  }
  if (err instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: err.message || "Unauthorized.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
