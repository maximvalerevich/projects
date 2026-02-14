import { AppSidebar } from '@/components/layout/AppSidebar';

export default async function BotLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ botId: string }>;
}) {
    const { botId } = await params;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <AppSidebar botId={botId} />
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
