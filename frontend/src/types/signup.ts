/**
 * Sign up related type definitions
 */

/**
 * Sign up form data
 */
export interface SignUpFormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * Terms agreement state
 */
export interface TermsAgreement {
    termsOfService: boolean;
    privacyPolicy: boolean;
    marketingConsent: boolean;
}

/**
 * Sign up response from API
 */
export interface SignUpResponse {
    success: boolean;
    message?: string;
}
