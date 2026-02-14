import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, Send, Calendar, Clock, ChevronRight } from 'lucide-react';

export default async function PostingPage({ params }: { params: Promise<{ botId: string }> }) {
    const supabase = await createClient();
    const { botId } = await params;

    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

    const scheduledPosts = posts?.filter(p => p.status === 'scheduled') || [];
    const sentPosts = posts?.filter(p => p.status === 'sent') || [];

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Posting</h1>
                    <p className="text-muted-foreground">Manage and schedule your broadcast messages.</p>
                </div>
                <Link
                    href={`/bot/${botId}/posting/new`}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" /> New Post
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Scheduled Posts */}
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <Calendar className="h-5 w-5 text-primary" />
                        Scheduled
                    </h2>
                    <div className="space-y-3">
                        {scheduledPosts.length > 0 ? (
                            scheduledPosts.map(post => (
                                <div key={post.id} className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium line-clamp-1">
                                                {/* Show summary of first text block or 'Untitled Post' */}
                                                {post.content_blocks?.[0]?.content || 'Untitled Post'}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(post.scheduled_at).toLocaleString()}
                                                </span>
                                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium uppercase text-[10px]">
                                                    Scheduled
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl text-muted-foreground bg-accent/20">
                                <p className="text-sm">No scheduled posts yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sent History */}
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <Send className="h-5 w-5 text-muted-foreground" />
                        Recently Sent
                    </h2>
                    <div className="space-y-3">
                        {sentPosts.length > 0 ? (
                            sentPosts.slice(0, 5).map(post => (
                                <div key={post.id} className="rounded-xl border border-border bg-card p-4 opacity-70">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium line-clamp-1">{post.content_blocks?.[0]?.content || 'Untitled Post'}</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Sent to {post.target_resources?.length || 0} resources on {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl text-muted-foreground">
                                <p className="text-sm">No post history.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bot Resources Quick Link */}
            <div className="rounded-xl border border-border bg-primary/5 p-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="font-semibold">Connected Resources</h3>
                    <p className="text-sm text-muted-foreground">Configure channels and groups where your bot can post.</p>
                </div>
                <Link href={`/bot/${botId}/posting/resources`} className="text-sm font-medium text-primary hover:underline">
                    Manage Resources →
                </Link>
            </div>
        </div>
    );
}
