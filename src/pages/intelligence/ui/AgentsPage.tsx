/**
 * @module pages/intelligence/agents
 * @description AI Agents management page
 */

import { Bot } from 'lucide-react';

export function AgentsPage() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-purple-50">
                    <Bot className="h-12 w-12 text-purple-600" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">AI Agents</h1>
                <p className="text-lg text-gray-500">Coming Soon</p>
                <p className="mt-2 text-sm text-gray-400">
                    Configure and manage your AI agents
                </p>
            </div>
        </div>
    );
}
