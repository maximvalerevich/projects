'use client';

import React from 'react';
import { Trash2, GripVertical, Image as ImageIcon, Type, Video, MoreHorizontal } from 'lucide-react';

export type BlockType = 'text' | 'image' | 'video' | 'media_group';

export interface BlockData {
    id: string;
    type: BlockType;
    content?: string; // For text
    url?: string; // For media
    settings?: {
        preview_disabled?: boolean;
        hide_media?: boolean;
        spoiler?: boolean;
        caption?: string;
    };
}

interface ContentBlockProps {
    block: BlockData;
    onChange: (id: string, updates: Partial<BlockData>) => void;
    onDelete: (id: string) => void;
}

export const ContentBlock = ({ block, onChange, onDelete }: ContentBlockProps) => {
    return (
        <div className="group relative flex gap-2 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/50">
            {/* Drag Handle (Visual only for now) */}
            <div className="flex cursor-move flex-col items-center justify-center text-muted-foreground opacity-50 group-hover:opacity-100">
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1 space-y-3">
                {/* Header: Icon + Type + Settings */}
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                        {block.type === 'text' && <Type className="h-3.5 w-3.5" />}
                        {block.type === 'image' && <ImageIcon className="h-3.5 w-3.5" />}
                        {block.type === 'video' && <Video className="h-3.5 w-3.5" />}
                        <span>{block.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(block.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {block.type === 'text' && (
                    <div className="space-y-2">
                        <textarea
                            value={block.content || ''}
                            onChange={(e) => onChange(block.id, { content: e.target.value })}
                            placeholder="Enter text..."
                            className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                                type="checkbox"
                                checked={block.settings?.preview_disabled || false}
                                onChange={(e) => onChange(block.id, { settings: { ...block.settings, preview_disabled: e.target.checked } })}
                                className="rounded border-input text-primary focus:ring-primary"
                            />
                            Disable link preview
                        </label>
                    </div>
                )}

                {(block.type === 'image' || block.type === 'video') && (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={block.url || ''}
                            onChange={(e) => onChange(block.id, { url: e.target.value })}
                            placeholder={`Paste ${block.type} URL...`}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {block.url && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={block.url} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                                type="checkbox"
                                checked={block.settings?.spoiler || false}
                                onChange={(e) => onChange(block.id, { settings: { ...block.settings, spoiler: e.target.checked } })}
                                className="rounded border-input text-primary focus:ring-primary"
                            />
                            Spoiler Effect
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};
