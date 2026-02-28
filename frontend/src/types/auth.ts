/**
 * Authentication-related type definitions
 */

/**
 * User login credentials
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * Authenticated user information
 */
export interface User {
    id: string;
    username: string;
    email: string;
    role?: string;
}

/**
 * Authentication response from API
 */
export interface AuthResponse {
    success: boolean;
    user: User;
    token: string;
    message?: string;
}

/**
 * Authentication context state
 */
export interface AuthContextState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
    signup: (
        email: string, 
        password: string, 
        name: string
    ) => Promise<boolean>;
    isLoading: boolean;
}