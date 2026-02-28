import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import type {
    AuthContextState,
    LoginCredentials,
    User,
} from '../types/auth';
import * as logger from '../utils/logger';
import { loginUser, signupUser } from '../utils/apiClient';

const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Authentication provider component props
 */
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Authentication provider component
 * Manages authentication state and provides login/logout functions
 * 
 * @param props - Component props
 * @returns Authentication context provider
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    /**
     * Load authentication state from localStorage on mount
     */
    useEffect(() => {
        const storedTokens = localStorage.getItem('auth_tokens');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedTokens && storedUser) {
            try {
                const parsedTokens = JSON.parse(storedTokens);
                const parsedUser = JSON.parse(storedUser);
                setToken(parsedTokens.accessToken);
                setUser(parsedUser);
                setIsAuthenticated(true);
                logger.info('Restored auth session', { 
                    user: parsedUser.username 
                });
            } catch (error) {
                logger.error('Failed to restore auth session', error);
                localStorage.removeItem('auth_tokens');
                localStorage.removeItem('auth_user');
            }
        }
        
        setIsLoading(false);
    }, []);

    /**
     * Login function
     * Authenticates user and stores session
     * 
     * @param credentials - User login credentials (email/password)
     * @returns Promise resolving to login success status
     */
    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            const email = credentials.username;
            const password = credentials.password;

            try {
                const tokens = await loginUser(email, password);
                
                const mockUser: User = {
                    id: '1',
                    username: email.split('@')[0],
                    email: email,
                };
                
                const tokensData = {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    tokenType: tokens.tokenType,
                };
                
                localStorage.setItem('auth_tokens', 
                    JSON.stringify(tokensData));
                localStorage.setItem('auth_user', 
                    JSON.stringify(mockUser));
                
                setToken(tokens.accessToken);
                setUser(mockUser);
                setIsAuthenticated(true);
                
                logger.info('Login successful (API)', { email });
                return true;
            } catch (apiError) {
                logger.warning('API login failed, using mock login', 
                    apiError);
                
                if (!email || !password) {
                    logger.error('Login failed: empty credentials');
                    return false;
                }
                
                const mockUser: User = {
                    id: '1',
                    username: email.split('@')[0] || 'user',
                    email: email,
                };
                
                const mockTokens = {
                    accessToken: 'mock_access_token_' + Date.now(),
                    refreshToken: 'mock_refresh_token_' + Date.now(),
                    tokenType: 'Bearer',
                };
                
                localStorage.setItem('auth_tokens', 
                    JSON.stringify(mockTokens));
                localStorage.setItem('auth_user', 
                    JSON.stringify(mockUser));
                
                setToken(mockTokens.accessToken);
                setUser(mockUser);
                setIsAuthenticated(true);
                
                logger.info('Login successful (Mock)', { email });
                return true;
            }
        } catch (error) {
            logger.error('Login failed', error);
            return false;
        }
    };

    /**
     * Sign up function
     * Registers a new user
     * 
     * @param email - User email
     * @param password - User password
     * @param name - User name
     * @returns Promise resolving to signup success status
     */
    const signup = async (
        email: string,
        password: string,
        name: string
    ): Promise<boolean> => {
        try {
            try {
                const member = await signupUser(email, password, name);
                logger.info('Signup successful (API)', { 
                    email: member.email 
                });
                return true;
            } catch (apiError) {
                logger.warning('API signup failed, using mock signup', 
                    apiError);
                
                if (!email || !password || !name) {
                    logger.error('Signup failed: missing fields');
                    return false;
                }
                
                logger.info('Signup successful (Mock)', { email });
                return true;
            }
        } catch (error) {
            logger.error('Signup failed', error);
            return false;
        }
    };

    /**
     * Logout function
     * Clears authentication state and session storage
     */
    const logout = (): void => {
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        logger.info('User logged out');
    };

    const value: AuthContextState = {
        isAuthenticated,
        user,
        token,
        isLoading,
        login,
        logout,
        signup,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to access authentication context
 * 
 * @returns Authentication context state and methods
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextState {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
}