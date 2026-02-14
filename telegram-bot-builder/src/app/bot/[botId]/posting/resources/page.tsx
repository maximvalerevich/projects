import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Shield, Plus, ArrowLeft, Info, Trash2, Globe, Lock } from 'lucide-react';

export default async function ResourcesPage({ params }: { params: Promise<{ botId: string }> }) {
    const supabase = await createClient();
    const { botId } = await params;

    const { data: resources } = await supabase
        .from('bot_resources')
        .select('*')
        .eq('bot_id', botId);

    return (
        <div className="p-8 max-w-4xl space-y-8">
            <div className="flex items-center gap-4">
                <Link href={`/bot/${botId}/posting`} className="p-2 rounded-full hover:bg-accent">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Bot Resources</h1>
                    <p className="text-muted-foreground">Manage channels, groups, and business accounts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Connection Instruction Card */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Info className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-blue-900">How to add a resource?</h3>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            To connect a channel or group, add your bot as an <strong>Administrator</strong> with the <strong>"Post Messages"</strong> permission.
                            Once added, send any message in the channel and the resource will automatically appear here.
                        </p>
                    </div>
                </div>

                {/* Resources List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold px-1">Active Resources ({resources?.length || 0})</h2>

                    {resources && resources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resources.map(res => (
                                <div key={res.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
                                            {res.title?.[0] || 'R'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{res.title}</div>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-medium">
                                                {res.type === 'channel' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                                {res.type}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-accent/10">
                            <Shield className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                            <p className="text-sm text-muted-foreground">No resources connected yet.</p>
                            <div className="mt-4 text-xs bg-card px-3 py-1 rounded-full border border-border text-muted-foreground font-medium uppercase tracking-wider">
                                Waiting for connection...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
