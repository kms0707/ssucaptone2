import { CircleUserRound, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface ProfilePageProps {
    onBackToProjects: () => void;
}

/**
 * Profile page for account information.
 *
 * @param {ProfilePageProps} props - Component props
 * @returns {JSX.Element} Profile page layout
 */
export function ProfilePage({ onBackToProjects }: ProfilePageProps): JSX.Element {
    const { user } = useAuth();

    const username = user?.username || "Unknown";
    const email = user?.email || "Unknown";
    const userId = user?.id || "Unknown";

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={onBackToProjects}
                        className="text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1.5 mb-3"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Projects
                    </button>
                    <h1 className="text-lg text-white">Profile</h1>
                    <p className="text-gray-600 text-[10px] mt-0.5">
                        View your account information
                    </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-5 w-1/2">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
                        <div className="size-14 border border-gray-700 bg-gray-800 flex items-center justify-center">
                            <CircleUserRound className="w-9 h-9 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm text-white">{username}</p>
                            <p className="text-[11px] text-gray-500">{email}</p>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <div className="flex items-center justify-between py-1 border-b border-gray-800">
                            <span className="text-[10px] uppercase text-gray-600">User ID</span>
                            <span className="text-xs text-gray-300 font-mono">{userId}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-gray-800">
                            <span className="text-[10px] uppercase text-gray-600">Username</span>
                            <span className="text-xs text-gray-300">{username}</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[10px] uppercase text-gray-600">Email</span>
                            <span className="text-xs text-gray-300">{email}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
