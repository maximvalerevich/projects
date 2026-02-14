import { AppSidebar } from '@/components/layout/AppSidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function BotLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ botId: string }>;
}) {
    const supabase = await createClient();
    const { botId } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Verify ownership
    const { data: bot, error } = await supabase
        .from('bots')
        .select('id, name')
        .eq('id', botId)
        .single();

    if (error || !bot) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Bot not found</h1>
                    <p className="text-muted-foreground">You may not have permission to view this bot.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <AppSidebar botId={botId} />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
