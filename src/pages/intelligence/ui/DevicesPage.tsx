/**
 * @module pages/intelligence/devices
 * @description Connected devices management page
 */

import { Smartphone } from 'lucide-react';

export function DevicesPage() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
                    <Smartphone className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Devices</h1>
                <p className="text-lg text-gray-500">Coming Soon</p>
                <p className="mt-2 text-sm text-gray-400">
                    Manage your connected devices and integrations
                </p>
            </div>
        </div>
    );
}
