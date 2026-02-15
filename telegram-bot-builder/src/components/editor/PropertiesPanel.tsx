import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    Settings,
    Type,
    Trash2,
    Plus,
    GitBranch,
    Braces,
    Check,
    ChevronDown,
    Link as LinkIcon
} from 'lucide-react';
import { ContentBlock } from '../content/ContentBlock';
import { v4 as uuidv4 } from 'uuid';

type PropertiesPanelProps = {
    botId: string;
    selectedNode: any | null;
    onPropertyChange: (nodeId: string, newData: any) => void;
};

export default function PropertiesPanel({ botId, selectedNode, onPropertyChange }: PropertiesPanelProps) {
    const supabase = createClient();
    const [variables, setVariables] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loadingVars, setLoadingVars] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingVars(true);
            setLoadingProducts(true);

            const [varRes, prodRes] = await Promise.all([
                supabase.from('variables').select('*').eq('bot_id', botId),
                supabase.from('products').select('*').eq('bot_id', botId)
            ]);

            setVariables(varRes.data || []);
            setProducts(prodRes.data || []);

            setLoadingVars(false);
            setLoadingProducts(false);
        };
        if (botId) fetchData();
    }, [botId, supabase]);

    const updateData = (updates: any) => {
        if (selectedNode) {
            onPropertyChange(selectedNode.id, updates);
        }
    };

    if (!selectedNode) {
        return (
            <aside className="w-[350px] border-l border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                    <Settings className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Properties</h3>
                    <p className="text-xs text-zinc-400">Select any node on the canvas to configure its behavior and content.</p>
                </div>
            </aside>
        );
    }

    const { type, data } = selectedNode;

    return (
        <aside className="w-[350px] border-l border-zinc-200 bg-white flex flex-col h-full shadow-lg overflow-y-auto">
            <div className="p-6 border-b border-zinc-100 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        {type === 'condition' ? <GitBranch className="h-4 w-4 text-amber-500" /> : <Type className="h-4 w-4 text-primary" />}
                        {type} Settings
                    </h2>
                    <span className="text-[10px] text-zinc-300 font-mono">#{selectedNode.id.split('-')[0]}</span>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-8 pb-20">
                {/* Node Label / Name */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Internal Name</label>
                    <input
                        type="text"
                        className="w-full text-sm font-medium border-b border-zinc-100 focus:border-primary outline-none py-1 transition-colors"
                        value={data.label || ''}
                        onChange={(e) => updateData({ label: e.target.value })}
                        placeholder="e.g. Welcome Message"
                    />
                </div>

                {/* Condition-Specific Rules */}
                {type === 'condition' && (
                    <div className="space-y-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Logic Rule</div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] text-amber-900/60 font-medium">Variable</label>
                                <select
                                    className="w-full h-9 rounded-md border border-amber-200 bg-white text-xs px-2 outline-none focus:ring-2 focus:ring-amber-500/20"
                                    value={data.settings?.condition?.variable || ''}
                                    onChange={(e) => updateData({
                                        settings: {
                                            ...data.settings,
                                            condition: { ...(data.settings?.condition || {}), variable: e.target.value }
                                        }
                                    })}
                                >
                                    <option value="">Select variable...</option>
                                    {variables.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] text-amber-900/60 font-medium">Operator</label>
                                    <select
                                        className="w-full h-9 rounded-md border border-amber-200 bg-white text-xs px-2 outline-none"
                                        value={data.settings?.condition?.operator || 'equals'}
                                        onChange={(e) => updateData({
                                            settings: {
                                                ...data.settings,
                                                condition: { ...(data.settings?.condition || {}), operator: e.target.value }
                                            }
                                        })}
                                    >
                                        <option value="equals">Equals</option>
                                        <option value="not_equals">Not equals</option>
                                        <option value="greater">Greater than</option>
                                        <option value="less">Less than</option>
                                        <option value="contains">Contains</option>
                                    </select>
                                </div>
                                <div className="flex-[1.5] space-y-1">
                                    <label className="text-[10px] text-amber-900/60 font-medium">Value</label>
                                    <input
                                        type="text"
                                        className="w-full h-9 rounded-md border border-amber-200 bg-white text-xs px-3 outline-none"
                                        placeholder="Value..."
                                        value={data.settings?.condition?.value || ''}
                                        onChange={(e) => updateData({
                                            settings: {
                                                ...data.settings,
                                                condition: { ...(data.settings?.condition || {}), value: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-amber-700 leading-relaxed italic">
                            If the rule is met, the "TRUE" handle will be used. Otherwise, it follows "FALSE".
                        </p>
                    </div>
                )}

                {/* Input-Specific Settings */}
                {type === 'input' && (
                    <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Input Settings</div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-blue-900/60 font-medium">Save to Variable</label>
                            <select
                                className="w-full h-9 rounded-md border border-blue-200 bg-white text-xs px-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={data.settings?.variable_name || ''}
                                onChange={(e) => updateData({
                                    settings: { ...data.settings, variable_name: e.target.value }
                                })}
                            >
                                <option value="">Select variable...</option>
                                {variables.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                            </select>
                            <p className="text-[10px] text-blue-700 leading-relaxed italic mt-2">
                                The user's reply will be saved to this variable.
                            </p>
                        </div>
                    </div>
                )}

                {/* Content Blocks (for message-carrying nodes) */}
                {type !== 'condition' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Content Blocks</label>
                            <button
                                onClick={() => updateData({
                                    content_blocks: [...(data.content_blocks || []), { id: uuidv4(), type: 'text', content: '' }]
                                })}
                                className="text-[10px] text-primary font-bold hover:underline"
                            >
                                + ADD BLOCK
                            </button>
                        </div>

                        <div className="space-y-3">
                            {(data.content_blocks || []).map((block: any) => (
                                <ContentBlock
                                    key={block.id}
                                    block={block}
                                    onChange={(id, updates) => {
                                        updateData({
                                            content_blocks: data.content_blocks.map((b: any) => b.id === id ? { ...b, ...updates } : b)
                                        });
                                    }}
                                    onDelete={(id) => {
                                        updateData({
                                            content_blocks: data.content_blocks.filter((b: any) => b.id !== id)
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Inline Keyboard Builder */}
                {type !== 'condition' && (
                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Inline Keyboard</h3>
                            <button
                                onClick={() => updateData({
                                    keyboard: [...(data.keyboard || []), { id: uuidv4(), text: 'New Button', type: 'url', value: '' }]
                                })}
                                className="text-[10px] text-primary font-bold hover:underline"
                            >
                                + ADD BUTTON
                            </button>
                        </div>

                        <div className="space-y-2">
                            {(data.keyboard || []).map((btn: any) => (
                                <div key={btn.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 text-xs font-semibold bg-transparent border-b border-zinc-200 focus:border-primary outline-none"
                                            value={btn.text}
                                            onChange={(e) => updateData({
                                                keyboard: data.keyboard.map((b: any) => b.id === btn.id ? { ...b, text: e.target.value } : b)
                                            })}
                                        />
                                        <button
                                            onClick={() => updateData({
                                                keyboard: data.keyboard.filter((b: any) => b.id !== btn.id)
                                            })}
                                            className="text-zinc-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="text-[10px] px-1 py-1 rounded bg-white border border-zinc-200 outline-none"
                                            value={btn.type}
                                            onChange={(e) => updateData({
                                                keyboard: data.keyboard.map((b: any) => b.id === btn.id ? { ...b, type: e.target.value } : b)
                                            })}
                                        >
                                            <option value="url">URL</option>
                                            <option value="node">Next Node</option>
                                            <option value="pay">Payment</option>
                                        </select>
                                        {btn.type === 'pay' ? (
                                            <select
                                                className="flex-1 text-[10px] px-2 py-1 rounded bg-white border border-zinc-200 outline-none"
                                                value={btn.value}
                                                onChange={(e) => updateData({
                                                    keyboard: data.keyboard.map((b: any) => b.id === btn.id ? { ...b, value: e.target.value } : b)
                                                })}
                                            >
                                                <option value="">Select product...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.price} {p.currency})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder={btn.type === 'node' ? 'Node ID...' : 'Value...'}
                                                className="flex-1 text-[10px] px-2 py-1 rounded bg-white border border-zinc-200 outline-none"
                                                value={btn.value}
                                                onChange={(e) => updateData({
                                                    keyboard: data.keyboard.map((b: any) => b.id === btn.id ? { ...b, value: e.target.value } : b)
                                                })}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
