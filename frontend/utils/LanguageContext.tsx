import { createContext, useContext, useState, ReactNode } from "react";
import { Language, translate } from "./translations";

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

interface LanguageProviderProps {
    children: ReactNode;
}

/**
 * Provider component for language context.
 * Manages the current language state and provides translation function.
 * 
 * @param {LanguageProviderProps} props - Component properties
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} The language provider component
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguage] = useState<Language>("en");

    /**
     * Translation function that uses the current language.
     * 
     * @param {string} key - The translation key
     * @returns {string} The translated text
     */
    const t = (key: string): string => {
        return translate(key, language);
    };

    const value: LanguageContextType = {
        language,
        setLanguage,
        t,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access the language context.
 * 
 * @returns {LanguageContextType} The language context value
 * @throws {Error} If used outside of LanguageProvider
 */
export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
}
