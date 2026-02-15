'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Plus,
    Trash2,
    Save,
    X,
    Braces,
    Type,
    Hash,
    CheckSquare,
    Loader2,
    AlertCircle
} from 'lucide-react';

interface Variable {
    id: string;
    bot_id: string;
    name: string;
    type: 'string' | 'number' | 'boolean';
    default_value: string;
    created_at: string;
}

export default function VariablesPage() {
    const params = useParams();
    const botId = params.botId as string;
    const supabase = createClient();

    const [variables, setVariables] = useState<Variable[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New variable state
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'string' | 'number' | 'boolean'>('string');
    const [newDefault, setNewDefault] = useState('');

    const fetchVariables = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('variables')
            .select('*')
            .eq('bot_id', botId)
            .order('name', { ascending: true });

        if (error) {
            setError(error.message);
        } else {
            setVariables(data || []);
        }
        setLoading(false);
    }, [botId, supabase]);

    useEffect(() => {
        fetchVariables();
    }, [fetchVariables]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setSaving(true);
        const { data, error } = await supabase
            .from('variables')
            .insert({
                bot_id: botId,
                name: newName.trim().toLowerCase().replace(/\s+/g, '_'),
                type: newType,
                default_value: newDefault
            })
            .select()
            .single();

        if (error) {
            alert('Error creating variable: ' + error.message);
        } else {
            setVariables([...variables, data].sort((a, b) => a.name.localeCompare(b.name)));
            setIsAdding(false);
            setNewName('');
            setNewDefault('');
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this variable? This may break logic in your constructor.')) return;

        const { error } = await supabase
            .from('variables')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting variable: ' + error.message);
        } else {
            setVariables(variables.filter(v => v.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Variables</h1>
                    <p className="text-muted-foreground text-sm">Define global variables to store user data and control bot logic.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                >
                    <Plus className="h-4 w-4" /> Create Variable
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {/* Add New Variable Form */}
                {isAdding && (
                    <form onSubmit={handleCreate} className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Name</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    placeholder="e.g. balance"
                                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground">Used in constructor as {"{variable_name}"}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Type</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value as any)}
                                >
                                    <option value="string">String (Text)</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Boolean (True/False)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Default Value</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 0"
                                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={newDefault}
                                    onChange={(e) => setNewDefault(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Variable
                            </button>
                        </div>
                    </form>
                )}

                {/* Variables List */}
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Name</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Type</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Default Value</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {variables.length > 0 ? (
                                variables.map(v => (
                                    <tr key={v.id} className="hover:bg-accent/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                    <Braces className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-semibold">{v.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {v.type === 'string' && <Type className="h-3.5 w-3.5" />}
                                                {v.type === 'number' && <Hash className="h-3.5 w-3.5" />}
                                                {v.type === 'boolean' && <CheckSquare className="h-3.5 w-3.5" />}
                                                <span className="capitalize">{v.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{v.default_value || 'NULL'}</code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDelete(v.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <Braces className="h-10 w-10 opacity-20" />
                                            <p className="text-sm">No variables defined. Create your first one to add logic!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
