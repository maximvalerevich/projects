import React from 'react';
import Link from 'next/link';
import { Users, Bot, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-white">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-zinc-200 bg-zinc-100 p-4">
                <div className="mb-8 flex items-center gap-2 px-2">
                    <LayoutDashboard className="h-6 w-6 text-zinc-900" />
                    <span className="text-lg font-bold text-zinc-900">Admin Panel</span>
                </div>

                <nav className="space-y-1">
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                    >
                        <Users className="h-4 w-4" />
                        Users
                    </Link>
                    <Link
                        href="/admin/bots"
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                    >
                        <Bot className="h-4 w-4" />
                        Bots
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
}
