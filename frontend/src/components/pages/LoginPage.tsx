import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface LoginPageProps {
    onNavigateToSignUp: () => void;
}

/**
 * Login page component with email and password authentication.
 * Provides form validation and error handling.
 * 
 * @param {LoginPageProps} props - Component properties
 * @param {Function} props.onNavigateToSignUp - Navigate to sign up page
 * @returns {JSX.Element} The login page layout
 */
export function LoginPage({
    onNavigateToSignUp,
}: LoginPageProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handles the login form submission.
     * 
     * @param {React.FormEvent} e - Form event
     * @returns {void}
     */
    const handleLogin = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const success = await login({
                username: email,
                password,
            });

            if (!success) {
                setError("Invalid credentials");
            }
        } catch (err) {
            setError("An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center 
            justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-gray-900 border border-gray-800 p-6">
                    <div className="mb-6 pb-4 border-b border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-gray-500" />
                            <h1 className="text-lg text-white">NIDS</h1>
                        </div>
                        <p className="text-gray-600 text-[10px]">
                            Network Intrusion Detection System
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-[10px] text-gray-600 
                                uppercase block mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border 
                                    border-gray-800 px-3 py-2 text-xs 
                                    text-gray-300 focus:outline-none 
                                    focus:border-gray-700"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-600 
                                uppercase block mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black border 
                                        border-gray-800 px-3 py-2 text-xs 
                                        text-gray-300 focus:outline-none 
                                        focus:border-gray-700"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 
                                        -translate-y-1/2 text-gray-600 
                                        hover:text-gray-500"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-3 h-3" />
                                    ) : (
                                        <Eye className="w-3 h-3" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border 
                                border-red-800 px-3 py-2">
                                <p className="text-red-400 text-xs">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-800 border 
                                border-gray-700 px-4 py-2 text-gray-400 
                                hover:text-gray-300 hover:bg-gray-700 
                                transition-colors text-xs disabled:opacity-50 
                                disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-gray-600 text-[10px] text-center">
                            Don't have an account?{" "}
                            <button
                                onClick={onNavigateToSignUp}
                                className="text-gray-500 hover:text-gray-400 
                                    underline"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
