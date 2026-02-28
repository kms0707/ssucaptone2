/**
 * API Key management type definitions
 */

/**
 * API Key status
 */
export type ApiKeyStatus = 'active' | 'revoked';

/**
 * API Key information
 */
export interface ApiKey {
    id: string;
    key: string;
    maskedKey: string;
    status: ApiKeyStatus;
    createdAt: string;
    lastUsed: string | null;
}

/**
 * API Key generation response
 */
export interface ApiKeyGenerateResponse {
    success: boolean;
    apiKey: ApiKey;
    message?: string;
}

/**
 * API Key revoke response
 */
export interface ApiKeyRevokeResponse {
    success: boolean;
    message?: string;
}
