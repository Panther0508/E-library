/**
 * Backup Authentication Service
 * 
 * A simple in-memory authentication system that works without Supabase.
 * Uses JWT tokens for session management.
 * 
 * Note: This is a backup system for development/fallback.
 * For production, use a proper auth provider like Supabase, Auth0, or NextAuth.
 */

import { cache } from './cache';

// Simple in-memory user store
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarColor: string;
  createdAt: number;
  lastLogin: number;
}

interface Session {
  userId: string;
  email: string;
  name: string;
  avatarColor: string;
  createdAt: number;
  expiresAt: number;
}

// Simple hash function (not secure for production - use bcrypt in production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Generate a simple JWT-like token
function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarColor: user.avatarColor,
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify and decode token
function verifyToken(token: string): Session | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (payload.expiresAt < Date.now()) {
      return null;
    }
    return {
      userId: payload.id,
      email: payload.email,
      name: payload.name,
      avatarColor: payload.avatarColor,
      createdAt: payload.createdAt,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

// Avatar colors
const avatarColors = [
  '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

function getRandomAvatarColor(): string {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

// In-memory storage
const users = new Map<string, User>();
const sessions = new Map<string, Session>();

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string, name: string): Promise<{
  success: boolean;
  user?: { id: string; email: string; name: string; avatarColor: string };
  token?: string;
  message?: string;
}> {
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if user already exists
  const existingUser = Array.from(users.values()).find(u => u.email === normalizedEmail);
  if (existingUser) {
    return { success: false, message: 'User already exists' };
  }
  
  // Create new user
  const user: User = {
    id: 'user_' + simpleHash(normalizedEmail + Date.now()),
    email: normalizedEmail,
    passwordHash: simpleHash(password + normalizedEmail),
    name: name.trim() || normalizedEmail.split('@')[0],
    avatarColor: getRandomAvatarColor(),
    createdAt: Date.now(),
    lastLogin: Date.now(),
  };
  
  users.set(user.id, user);
  
  // Generate session token
  const token = generateToken(user);
  
  // Store session
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    name: user.name,
    avatarColor: user.avatarColor,
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
  });
  
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarColor: user.avatarColor,
    },
    token,
    message: 'Account created successfully',
  };
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<{
  success: boolean;
  user?: { id: string; email: string; name: string; avatarColor: string };
  token?: string;
  message?: string;
}> {
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();
  
  // Find user
  const user = Array.from(users.values()).find(u => u.email === normalizedEmail);
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Verify password
  const passwordHash = simpleHash(password + normalizedEmail);
  if (user.passwordHash !== passwordHash) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Update last login
  user.lastLogin = Date.now();
  users.set(user.id, user);
  
  // Generate session token
  const token = generateToken(user);
  
  // Store session
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    name: user.name,
    avatarColor: user.avatarColor,
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
  });
  
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarColor: user.avatarColor,
    },
    token,
    message: 'Login successful',
  };
}

/**
 * Verify session token
 */
export function verifySession(token: string): Session | null {
  return verifyToken(token);
}

/**
 * Logout user
 */
export function logoutUser(token: string): boolean {
  return sessions.delete(token);
}

/**
 * Get user by ID
 */
export function getUser(userId: string): User | undefined {
  return users.get(userId);
}

/**
 * Check if email exists
 */
export function emailExists(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  return Array.from(users.values()).some(u => u.email === normalizedEmail);
}

/**
 * Get session count (for debugging)
 */
export function getStats() {
  return {
    users: users.size,
    sessions: sessions.size,
  };
}

/**
 * Clean up expired sessions
 */
export function cleanupSessions(): number {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token);
      cleaned++;
    }
  }
  
  return cleaned;
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupSessions, 5 * 60 * 1000);
}

export default {
  registerUser,
  loginUser,
  verifySession,
  logoutUser,
  getUser,
  emailExists,
  getStats,
  cleanupSessions,
};
