'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    ArrowLeft,
    Plus,
    Send,
    Calendar,
    Clock,
    Settings,
    Eye,
    Trash2,
    CheckCircle2,
    Shield,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { ContentBlock } from '@/components/content/ContentBlock';

export default function NewPostPage() {
    const params = useParams();
    const router = useRouter();
    const botId = params.botId as string;

    const [blocks, setBlocks] = useState<any[]>([
        { id: uuidv4(), type: 'text', content: '', settings: { disable_link_preview: false } }
    ]);
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [selectedResources, setSelectedResources] = useState<string[]>(['main_channel']);

    const supabase = createClient();

    const addBlock = (type: 'text' | 'image' | 'video') => {
        setBlocks([...blocks, {
            id: uuidv4(),
            type,
            content: '',
            settings: type === 'text' ? { preview_disabled: false } : { spoiler: false }
        }]);
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, updates: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleSchedule = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('posts')
                .insert({
                    bot_id: botId,
                    content_blocks: blocks,
                    status: 'scheduled',
                    scheduled_at: new Date(Date.now() + 3600000).toISOString(),
                    settings: {
                        protect_content: false,
                        silent_notification: false
                    },
                    target_resources: selectedResources
                });

            if (error) throw error;
            router.push(`/bot/${botId}/posting`);
        } catch (err: any) {
            console.error(err);
            alert('Failed to schedule post: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f4f6f8]">
            {/* Left Section: Content Editor */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href={`/bot/${botId}/posting`} className="p-2 rounded-full hover:bg-zinc-100">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-lg font-semibold">Create Broadcast</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md">
                            <Eye className="h-4 w-4" /> Preview
                        </button>
                        <button className="inline-flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Schedule Post
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto space-y-6 pb-20">
                        {/* Post Internal Title */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Internal Title (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Weekly Promo #4"
                                className="w-full text-xl font-bold border-none outline-none focus:ring-0 placeholder:text-zinc-200"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            {blocks.map((block) => (
                                <ContentBlock
                                    key={block.id}
                                    block={block}
                                    onChange={(id, updates) => updateBlock(id, updates)}
                                    onDelete={(id) => deleteBlock(id)}
                                />
                            ))}
                        </div>

                        {/* Add Block Buttons */}
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <button
                                onClick={() => addBlock('text')}
                                className="flex flex-col items-center gap-2 p-4 w-24 rounded-xl border border-dashed border-zinc-300 hover:border-primary hover:bg-primary/5 group transition-all"
                            >
                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <span className="font-bold text-lg">T</span>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase group-hover:text-primary">Text</span>
                            </button>
                            <button
                                onClick={() => addBlock('image')}
                                className="flex flex-col items-center gap-2 p-4 w-24 rounded-xl border border-dashed border-zinc-300 hover:border-primary hover:bg-primary/5 group transition-all"
                            >
                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase group-hover:text-primary">Image</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section: Settings Sidebar */}
            <aside className="w-[320px] bg-white border-l border-zinc-200 flex flex-col h-full shadow-lg shrink-0">
                <div className="p-6 border-b border-zinc-100">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Post Settings
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Destination Selection */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Target Resources</label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-primary text-white flex items-center justify-center text-[10px] font-bold">M</div>
                                    <span className="text-sm font-medium">Main Channel</span>
                                </div>
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                            </div>
                            <button className="w-full py-2 border border-dashed border-zinc-200 rounded-lg text-xs text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition-colors">
                                + Select More Resources
                            </button>
                        </div>
                    </div>

                    {/* Scheduling */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Schedule</label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <input type="radio" id="now" name="schedule" defaultChecked className="text-primary focus:ring-primary h-4 w-4" />
                                <label htmlFor="now" className="text-sm font-medium">Publish Now</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="radio" id="later" name="schedule" className="text-primary focus:ring-primary h-4 w-4" />
                                <label htmlFor="later" className="text-sm font-medium">Post Later</label>
                            </div>
                            <div className="pl-7 space-y-2 opacity-50 pointer-events-none">
                                <div className="flex gap-2">
                                    <div className="flex-1 border rounded px-2 py-1 flex items-center gap-2 bg-zinc-50">
                                        <Calendar className="h-3 w-3" />
                                        <span className="text-xs">15.02.2026</span>
                                    </div>
                                    <div className="w-24 border rounded px-2 py-1 flex items-center gap-2 bg-zinc-50">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-xs">12:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Options</label>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm">Protect Content</span>
                                </div>
                                <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Send className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm">Silent Notification</span>
                                </div>
                                <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-zinc-50 border-t border-zinc-200">
                    <button
                        onClick={handleSchedule}
                        disabled={isSaving}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SCHEDULE BROADCAST'}
                    </button>
                    <p className="mt-4 text-[10px] text-center text-zinc-400 leading-relaxed uppercase tracking-tighter">
                        Scheduled posts appear in your dashboard until sent.
                    </p>
                </div>
            </aside>
        </div>
    );
}
