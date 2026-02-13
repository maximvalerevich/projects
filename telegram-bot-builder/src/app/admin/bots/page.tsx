import { createAdminClient } from '@/utils/supabase/admin';

export default async function AdminBotsPage() {
    const supabase = createAdminClient();

    // Fetch bots. We need a service role client to bypass RLS if we want to see ALL bots, 
    // ensuring the RLS policy allows service role access (it usually does by default or we can add `using (true)` for service role).
    const { data: bots, error } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="text-red-500">Error loading bots: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-zinc-900">Bots</h1>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bots?.map((bot) => (
                    <div key={bot.id} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-zinc-900">{bot.name}</h3>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Online
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500 truncate">Token: {bot.token.substring(0, 10)}...</p>
                        <div className="mt-4 flex justify-end">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                Preview Flow
                            </button>
                        </div>
                    </div>
                ))}

                {(!bots || bots.length === 0) && (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        No bots found.
                    </div>
                )}
            </div>
        </div>
    );
}
