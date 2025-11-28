
import { User } from '../types';
import { dbService } from './db';

// We use localStorage ONLY for the session token to persist login state.
// All user data is now managed in IndexedDB via dbService.
const TOKEN_KEY = 'multigen_token';

// --- Public API ---

const register = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const existingUser = await dbService.getUser(email);
  if (existingUser) {
    throw new Error('User with this email already exists.');
  }
  
  // IMPORTANT: In a real backend, you MUST hash the password.
  // We are storing it as-is here because this is a client-side database demo.
  const newUser = {
    id: new Date().toISOString(),
    name,
    email,
    password: password, 
  };

  await dbService.addUser(newUser);

  const userPayload = { id: newUser.id, name: newUser.name, email: newUser.email };
  // Simulate a JWT token
  const token = btoa(JSON.stringify(userPayload));
  localStorage.setItem(TOKEN_KEY, token);

  return { user: userPayload, token };
};

const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await dbService.getUser(email);

  if (!user || (user.password !== password && !user.isGoogle)) {
    throw new Error('Invalid email or password.');
  }
  
  const userPayload = { id: user.id, name: user.name, email: user.email };
  // Simulate a JWT token
  const token = btoa(JSON.stringify(userPayload));
  localStorage.setItem(TOKEN_KEY, token);

  return { user: userPayload, token };
};

const loginWithGoogle = async (): Promise<{ user: User; token: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Check if a google user exists or create one
  const email = 'google.user@gmail.com';
  let user = await dbService.getUser(email);

  if (!user) {
    user = {
      id: 'google_' + Date.now(),
      name: 'Google User',
      email: email,
      password: '', // No password for OAuth
      isGoogle: true
    };
    await dbService.addUser(user);
  }
  
  const userPayload = { id: user.id, name: user.name, email: user.email };
  const token = btoa(JSON.stringify(userPayload));
  localStorage.setItem(TOKEN_KEY, token);

  return { user: userPayload, token };
};

const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getCurrentUser = (): User | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    // Decode the simulated token
    return JSON.parse(atob(token));
  } catch (error) {
    console.error("Failed to parse user token", error);
    return null;
  }
};

export const authService = {
  register,
  login,
  loginWithGoogle,
  logout,
  getCurrentUser,
};