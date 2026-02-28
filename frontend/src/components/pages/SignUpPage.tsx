import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface SignUpPageProps {
    onSignUp: () => void;
    onNavigateToLogin: () => void;
}

/**
 * Sign up page component with registration form.
 * Includes validation, terms acceptance, and phone verification.
 * 
 * @param {SignUpPageProps} props - Component properties
 * @param {Function} props.onSignUp - Callback when signup is successful
 * @param {Function} props.onNavigateToLogin - Navigate to login page
 * @returns {JSX.Element} The sign up page layout
 */
export function SignUpPage({ 
    onSignUp, 
    onNavigateToLogin 
}: SignUpPageProps) {
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        verificationCode: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Updates form field values.
     * 
     * @param {string} field - Field name
     * @param {string} value - New value
     * @returns {void}
     */
    const updateField = (field: string, value: string): void => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    /**
     * Sends verification code to phone number.
     * 
     * @returns {void}
     */
    const handleSendCode = (): void => {
        if (formData.phone.length < 10) {
            setError("Invalid phone number");
            return;
        }
        setCodeSent(true);
        setError("");
    };

    /**
     * Validates all form fields.
     * 
     * @returns {boolean} True if form is valid
     */
    const validateForm = (): boolean => {
        if (!formData.name || !formData.email || !formData.password) {
            setError("All fields are required");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return false;
        }

        if (!termsAccepted || !privacyAccepted) {
            setError("Please accept all agreements");
            return false;
        }

        if (!codeSent || !formData.verificationCode) {
            setError("Phone verification required");
            return false;
        }

        return true;
    };

    /**
     * Handles form submission.
     * \n * @param {React.FormEvent} e - Form event
     * @returns {void}
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        
        try {
            const success = await signup(
                formData.email,
                formData.password,
                formData.name
            );
            
            if (success) {
                onSignUp();
            } else {
                setError("Signup failed. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error 
                ? err.message 
                : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center 
            justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="bg-gray-900 border border-gray-800 p-6">
                    <div className="mb-4 pb-3 border-b border-gray-800">
                        <button
                            onClick={onNavigateToLogin}
                            className="text-gray-600 hover:text-gray-500 
                                mb-2 flex items-center gap-1.5 text-xs"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Back to login
                        </button>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5 text-gray-500" />
                            <h1 className="text-lg text-white">
                                Create Account
                            </h1>
                        </div>
                        <p className="text-gray-600 text-[10px]">
                            Register for NIDS access
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-[10px] text-gray-600 
                                    uppercase block mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => 
                                        updateField("name", e.target.value)}
                                    className="w-full bg-black border 
                                        border-gray-800 px-3 py-2 text-xs 
                                        text-gray-300 focus:outline-none 
                                        focus:border-gray-700"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-600 
                                    uppercase block mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => 
                                        updateField("email", e.target.value)}
                                    className="w-full bg-black border 
                                        border-gray-800 px-3 py-2 text-xs 
                                        text-gray-300 focus:outline-none 
                                        focus:border-gray-700"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-[10px] text-gray-600 
                                    uppercase block mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => 
                                            updateField("password", e.target.value)}
                                        className="w-full bg-black border 
                                            border-gray-800 px-3 py-2 text-xs 
                                            text-gray-300 focus:outline-none 
                                            focus:border-gray-700"
                                        placeholder="Min. 8 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => 
                                            setShowPassword(!showPassword)}
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

                            <div>
                                <label className="text-[10px] text-gray-600 
                                    uppercase block mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword 
                                            ? "text" 
                                            : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => 
                                            updateField("confirmPassword", 
                                                e.target.value)}
                                        className="w-full bg-black border 
                                            border-gray-800 px-3 py-2 text-xs 
                                            text-gray-300 focus:outline-none 
                                            focus:border-gray-700"
                                        placeholder="Re-enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => 
                                            setShowConfirmPassword(
                                                !showConfirmPassword)}
                                        className="absolute right-2 top-1/2 
                                            -translate-y-1/2 text-gray-600 
                                            hover:text-gray-500"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-3 h-3" />
                                        ) : (
                                            <Eye className="w-3 h-3" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-[10px] text-gray-600 
                                uppercase block mb-1.5">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => 
                                        updateField("phone", e.target.value)}
                                    className="flex-1 bg-black border 
                                        border-gray-800 px-3 py-2 text-xs 
                                        text-gray-300 focus:outline-none 
                                        focus:border-gray-700"
                                    placeholder="010-1234-5678"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={codeSent}
                                    className="bg-gray-800 border 
                                        border-gray-700 px-3 py-2 
                                        text-gray-400 hover:text-gray-300 
                                        hover:bg-gray-700 transition-colors 
                                        text-xs whitespace-nowrap 
                                        disabled:opacity-50"
                                >
                                    {codeSent ? "Code Sent" : "Send Code"}
                                </button>
                            </div>
                        </div>

                        {codeSent && (
                            <div className="mb-4">
                                <label className="text-[10px] text-gray-600 
                                    uppercase block mb-1.5">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.verificationCode}
                                    onChange={(e) => 
                                        updateField("verificationCode", 
                                            e.target.value)}
                                    className="w-full bg-black border 
                                        border-gray-800 px-3 py-2 text-xs 
                                        text-gray-300 focus:outline-none 
                                        focus:border-gray-700"
                                    placeholder="Enter 6-digit code"
                                    required
                                />
                            </div>
                        )}

                        <div className="mb-4 space-y-2 p-3 bg-black border 
                            border-gray-800">
                            <label className="flex items-start gap-2 
                                cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => 
                                        setTermsAccepted(e.target.checked)}
                                    className="mt-0.5 w-3 h-3 bg-gray-900 
                                        border border-gray-700"
                                />
                                <span className="text-xs text-gray-600 
                                    group-hover:text-gray-500">
                                    I agree to the Terms of Service
                                </span>
                            </label>
                            <label className="flex items-start gap-2 
                                cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={privacyAccepted}
                                    onChange={(e) => 
                                        setPrivacyAccepted(e.target.checked)}
                                    className="mt-0.5 w-3 h-3 bg-gray-900 
                                        border border-gray-700"
                                />
                                <span className="text-xs text-gray-600 
                                    group-hover:text-gray-500">
                                    I agree to the Privacy Policy
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-900/20 border 
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
                                transition-colors text-xs 
                                disabled:opacity-50 
                                disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}