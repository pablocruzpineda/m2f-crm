/**
 * @module pages/intelligence/credits
 * @description Credits management page for AI features
 */

import { Coins } from 'lucide-react';

export function CreditsPage() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                    <Coins className="h-12 w-12 text-blue-600" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Credits</h1>
                <p className="text-lg text-gray-500">Coming Soon</p>
                <p className="mt-2 text-sm text-gray-400">
                    Manage your AI credits and usage
                </p>
            </div>
        </div>
    );
}
