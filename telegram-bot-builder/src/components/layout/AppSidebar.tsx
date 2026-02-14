'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShieldCheck,
    Send,
    Workflow,
    Bot,
    ShoppingBag,
    MessageCircle,
    Braces,
    BarChart3,
    Settings,
    ChevronLeft
} from 'lucide-react';

interface AppSidebarProps {
    botId: string;
}

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '' },
    { name: 'Moderation', icon: ShieldCheck, href: '/moderation' },
    { name: 'Posting', icon: Send, href: '/posting' },
    { name: 'Scenarios', icon: Workflow, href: '/scenarios' },
    { name: 'Constructor', icon: Bot, href: '/constructor' },
    { name: 'Shop', icon: ShoppingBag, href: '/shop' },
    { name: 'Dialogs', icon: MessageCircle, href: '/dialogs' },
    { name: 'Variables', icon: Braces, href: '/variables' },
    { name: 'Statistics', icon: BarChart3, href: '/statistics' },
    { name: 'Settings', icon: Settings, href: '/settings' },
];

export function AppSidebar({ botId }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card text-card-foreground">
            {/* Sidebar Header */}
            <div className="flex h-14 items-center border-b border-border px-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Bots
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        let href = `/bot/${botId}${item.href}`;

                        // Highlight active if pathname starts with href (simple check)
                        const isActive = pathname === href || (item.href !== '' && pathname.startsWith(href));

                        return (
                            <Link
                                key={item.name}
                                href={href}
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-border p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        B
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">My Bot</span>
                        <span className="text-xs text-muted-foreground">Free Plan</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
