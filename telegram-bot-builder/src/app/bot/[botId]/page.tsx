import { createClient } from '@/utils/supabase/server';

export default async function BotDashboardPage({ params }: { params: Promise<{ botId: string }> }) {
    const supabase = await createClient();
    const { botId } = await params;

    const { data: bot } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single();

    const stats = bot?.stats || { subscribers: 0, revenue: 0, activity: 0 };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard: {bot?.name}</h1>
                <p className="text-muted-foreground">General overview and statistics for your bot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground uppercase">Subscribers</div>
                    <div className="mt-2 text-3xl font-bold">{stats.subscribers}</div>
                    <div className="mt-1 text-xs text-green-600 font-medium">+0% from last week</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground uppercase">Revenue</div>
                    <div className="mt-2 text-3xl font-bold">${stats.revenue}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Total earnings from shop</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground uppercase">Activity</div>
                    <div className="mt-2 text-3xl font-bold">{stats.activity}%</div>
                    <div className="mt-1 text-xs text-blue-600 font-medium">User engagement rate</div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    {/* Add buttons or quick links here */}
                    <div className="text-sm text-muted-foreground italic">Connect your Telegram account to see more real-time data.</div>
                </div>
            </div>
        </div>
    );
}
