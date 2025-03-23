
import { User } from '@/types/auth';

// Mock users for demo purposes
const mockUsers = [
  {
    id: '1',
    name: 'Ahmed Ben Ali',
    email: 'ahmed@example.com',
    password: 'password123',
    avatar: '/assets/avatars/ahmed.jpg',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Leila Sfar',
    email: 'leila@example.com',
    password: 'password123',
    role: 'user'
  }
] as const;

// Local storage key
const USER_STORAGE_KEY = 'agrismart_user';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get user from local storage
export const getCurrentUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    return JSON.parse(storedUser) as User;
  }
  return null;
};

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API call delay
  await delay(1000);
  
  // Find user with matching credentials
  const user = mockUsers.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password
  );
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Remove password before storing and returning
  const { password: _, ...userWithoutPassword } = user;
  
  // Store in local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
  
  return userWithoutPassword as User;
};

// Signup function
export const signup = async (name: string, email: string, password: string): Promise<User> => {
  // Simulate API call delay
  await delay(1000);
  
  // Check if email already exists
  if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already in use');
  }
  
  // Create new user
  const newUser: User = {
    id: Math.random().toString(36).substring(2, 9),
    name,
    email,
    role: 'user',
  };
  
  // Store in local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  
  return newUser;
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};
