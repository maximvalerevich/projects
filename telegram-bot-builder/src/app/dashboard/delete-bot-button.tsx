'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface DeleteBotButtonProps {
    botId: string;
    botName: string;
}

export default function DeleteBotButton({ botId, botName }: DeleteBotButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('bots')
                .delete()
                .eq('id', botId);

            if (error) throw error;
            router.refresh();
        } catch (err: any) {
            alert('Error deleting bot: ' + err.message);
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-red-500 uppercase">Confirm?</span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="text-[10px] text-zinc-400 font-bold hover:underline"
                >
                    CANCEL
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
            title="Delete Bot"
        >
            <Trash2 className="h-4.5 w-4.5" />
        </button>
    );
}
