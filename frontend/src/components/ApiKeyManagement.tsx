import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Key, Copy, RotateCw, ShieldX, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';
import * as logger from '../utils/logger';
import type { ApiKey } from '../types/apiKey';

/**
 * API Key management component
 * Displays API key information and management actions
 * 
 * @returns API Key section JSX element
 */
export function ApiKeyManagement(): JSX.Element {
    const { t } = useLanguage();
    const [apiKey, setApiKey] = useState<ApiKey | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<
        'regenerate' | 'revoke' | null
    >(null);

    /**
     * Generates a new API key
     * TODO: Replace with real API call to /api/auth/api-key/generate
     */
    const handleGenerateApiKey = async (): Promise<void> => {
        setIsGenerating(true);
        logger.info('Generating new API key');

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock API key generation
            const newKey = `sk-${generateRandomString(48)}`;
            const maskedKey = `sk-****${newKey.slice(-8)}`;

            const generatedKey: ApiKey = {
                id: `key_${Date.now()}`,
                key: newKey,
                maskedKey: maskedKey,
                status: 'active',
                createdAt: new Date().toISOString(),
                lastUsed: null,
            };

            setApiKey(generatedKey);
            logger.info('API key generated successfully');
        } catch (error) {
            logger.error('Failed to generate API key', error);
        } finally {
            setIsGenerating(false);
        }
    };

    /**
     * Regenerates the existing API key
     */
    const handleRegenerateApiKey = async (): Promise<void> => {
        setShowConfirm(null);
        await handleGenerateApiKey();
    };

    /**
     * Revokes the current API key
     */
    const handleRevokeApiKey = (): void => {
        logger.info('Revoking API key');
        setShowConfirm(null);

        if (apiKey) {
            setApiKey({
                ...apiKey,
                status: 'revoked',
            });
        }
    };

    /**
     * Copies the API key to clipboard
     */
    const handleCopyApiKey = async (): Promise<void> => {
        if (!apiKey) return;

        try {
            await navigator.clipboard.writeText(apiKey.key);
            setIsCopied(true);
            logger.info('API key copied to clipboard');

            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            logger.error('Failed to copy API key', error);
        }
    };

    /**
     * Renders the card header
     * 
     * @returns Card header component
     */
    const renderHeader = (): JSX.Element => {
        return (
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                    <Key className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl text-white mb-2">
                        {t('apiKeyManagement')}
                    </h2>
                    <p className="text-gray-400">
                        {t('apiKeyManagementDesc')}
                    </p>
                </div>
            </div>
        );
    };

    /**
     * Renders the empty state when no API key exists
     * 
     * @returns Empty state component
     */
    const renderEmptyState = (): JSX.Element => {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                    <Key className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-white text-lg mb-2">
                    {t('noApiKey')}
                </h3>
                <p className="text-gray-400 mb-6">
                    {t('noApiKeyDesc')}
                </p>
                <Button
                    onClick={handleGenerateApiKey}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    <Key className="w-4 h-4 mr-2" />
                    {t('generateApiKey')}
                </Button>
            </div>
        );
    };

    /**
     * Formats date string to readable format
     * 
     * @param dateString - ISO date string
     * @returns Formatted date string
     */
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString();
    };

    /**
     * Renders the API key information
     * 
     * @returns API key info component
     */
    const renderApiKeyInfo = (): JSX.Element => {
        if (!apiKey) return <></>;

        const isRevoked = apiKey.status === 'revoked';

        return (
            <div className="space-y-6">
                {/* API Key Display */}
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <Label className="text-gray-400 text-sm mb-2 block">
                        API Key
                    </Label>
                    <div className="flex items-center gap-3">
                        <code className="flex-1 text-white font-mono text-lg bg-gray-800 px-4 py-3 rounded-lg">
                            {apiKey.maskedKey}
                        </code>
                        <Button
                            onClick={handleCopyApiKey}
                            disabled={isRevoked}
                            variant="outline"
                            className="border-gray-600"
                        >
                            {isCopied ? (
                                <Check className="w-4 h-4 text-green-400" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Status and Metadata */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label className="text-gray-400 text-sm">
                            Status
                        </Label>
                        <div className="mt-2">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                    isRevoked
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-green-500/20 text-green-400'
                                }`}
                            >
                                {t(isRevoked ? 'apiKeyRevoked' : 'apiKeyActive')}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Label className="text-gray-400 text-sm">
                            {t('apiKeyCreatedAt')}
                        </Label>
                        <p className="text-white mt-2">
                            {formatDate(apiKey.createdAt)}
                        </p>
                    </div>
                    <div>
                        <Label className="text-gray-400 text-sm">
                            {t('apiKeyLastUsed')}
                        </Label>
                        <p className="text-white mt-2">
                            {apiKey.lastUsed 
                                ? formatDate(apiKey.lastUsed) 
                                : t('apiKeyNever')
                            }
                        </p>
                    </div>
                </div>

                {/* Usage Information */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-300 text-sm">
                        {t('apiKeyUsageInfo')}
                    </p>
                </div>

                {/* Action Buttons */}
                {!isRevoked && (
                    <>
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                                <p className="text-yellow-300 text-sm">
                                    {t('apiKeyWarning')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowConfirm('regenerate')}
                                variant="outline"
                                className="border-gray-600 text-gray-300"
                            >
                                <RotateCw className="w-4 h-4 mr-2" />
                                {t('regenerateApiKey')}
                            </Button>
                            <Button
                                onClick={() => setShowConfirm('revoke')}
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-500/10"
                            >
                                <ShieldX className="w-4 h-4 mr-2" />
                                {t('revokeApiKey')}
                            </Button>
                        </div>
                    </>
                )}

                {/* Regenerate if revoked */}
                {isRevoked && (
                    <Button
                        onClick={handleGenerateApiKey}
                        disabled={isGenerating}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        <Key className="w-4 h-4 mr-2" />
                        {t('generateApiKey')}
                    </Button>
                )}
            </div>
        );
    };

    /**
     * Renders confirmation dialog
     * 
     * @returns Confirmation dialog component
     */
    const renderConfirmDialog = (): JSX.Element | null => {
        if (!showConfirm) return null;

        const isRegenerate = showConfirm === 'regenerate';

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="bg-gray-800 border-gray-700 p-6 max-w-md w-full">
                    <h3 className="text-white text-xl mb-4">
                        {t(isRegenerate ? 'confirmRegenerate' : 'confirmRevoke')}
                    </h3>
                    <div className="flex gap-3 justify-end">
                        <Button
                            onClick={() => setShowConfirm(null)}
                            variant="outline"
                            className="border-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={
                                isRegenerate 
                                    ? handleRegenerateApiKey 
                                    : handleRevokeApiKey
                            }
                            className={
                                isRegenerate 
                                    ? 'bg-purple-600 hover:bg-purple-700' 
                                    : 'bg-red-600 hover:bg-red-700'
                            }
                        >
                            Confirm
                        </Button>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <Card className="bg-gray-800 border-gray-700 p-8">
            {renderHeader()}
            {apiKey ? renderApiKeyInfo() : renderEmptyState()}
            {renderConfirmDialog()}
        </Card>
    );
}

/**
 * Generates a random string for mock API key
 * 
 * @param length - Length of string to generate
 * @returns Random string
 */
function generateRandomString(length: number): string {
    const chars = 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}