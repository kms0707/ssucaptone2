import { useState } from "react";
import { X, Save, Tag } from "lucide-react";
import { useLanguage } from "../utils/LanguageContext";

interface SessionSaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        name: string,
        description: string,
        tags: string[]
    ) => void;
}

/**
 * Modal for saving current detection session.
 * Allows user to name, describe, and tag the session.
 * 
 * @param {SessionSaveModalProps} props - Component properties
 * @returns {JSX.Element | null} The modal or null if closed
 */
export function SessionSaveModal({
    isOpen,
    onClose,
    onSave,
}: SessionSaveModalProps): JSX.Element | null {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    if (!isOpen) return null;

    /**
     * Handles adding a new tag.
     * 
     * @returns {void}
     */
    const handleAddTag = (): void => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    /**
     * Handles removing a tag.
     * 
     * @param {string} tag - The tag to remove
     * @returns {void}
     */
    const handleRemoveTag = (tag: string): void => {
        setTags(tags.filter((t) => t !== tag));
    };

    /**
     * Handles saving the session.
     * 
     * @returns {void}
     */
    const handleSave = (): void => {
        if (!name.trim()) return;
        
        onSave(name.trim(), description.trim(), tags);
        
        setName("");
        setDescription("");
        setTags([]);
        setTagInput("");
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center 
            justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 
                w-full max-w-md">
                <div className="flex items-center justify-between 
                    border-b border-gray-800 px-4 py-3">
                    <h2 className="text-sm text-white">
                        {t("saveSession")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-400 
                            transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-600 
                            uppercase block mb-1.5">
                            {t("sessionName")} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("sessionNamePlaceholder")}
                            className="w-full bg-black border 
                                border-gray-800 px-3 py-2 text-xs 
                                text-gray-300 focus:outline-none 
                                focus:border-teal-500"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-600 
                            uppercase block mb-1.5">
                            {t("description")}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("descriptionPlaceholder")}
                            className="w-full bg-black border 
                                border-gray-800 px-3 py-2 text-xs 
                                text-gray-300 focus:outline-none 
                                focus:border-teal-500 resize-none"
                            rows={3}
                            maxLength={200}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-600 
                            uppercase block mb-1.5">
                            {t("tags")}
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder={t("addTag")}
                                className="flex-1 bg-black border 
                                    border-gray-800 px-3 py-1.5 text-xs 
                                    text-gray-300 focus:outline-none 
                                    focus:border-teal-500"
                                maxLength={20}
                            />
                            <button
                                onClick={handleAddTag}
                                className="bg-gray-800 border 
                                    border-gray-700 px-3 py-1.5 
                                    text-gray-400 hover:text-gray-300 
                                    hover:bg-gray-700 transition-colors 
                                    text-xs"
                            >
                                <Tag className="w-3 h-3" />
                            </button>
                        </div>
                        
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-gray-800 border 
                                            border-gray-700 px-2 py-1 
                                            text-[10px] text-gray-400 
                                            flex items-center gap-1.5"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-red-400 
                                                transition-colors"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-800 px-4 py-3 
                    flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-800 border border-gray-700 
                            px-4 py-2 text-gray-400 hover:text-gray-300 
                            hover:bg-gray-700 transition-colors text-xs"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="bg-teal-900/30 border border-teal-800 
                            px-4 py-2 text-teal-400 hover:bg-teal-900/50 
                            transition-colors text-xs flex items-center 
                            gap-1.5 disabled:opacity-50 
                            disabled:cursor-not-allowed"
                    >
                        <Save className="w-3 h-3" />
                        {t("save")}
                    </button>
                </div>
            </div>
        </div>
    );
}
