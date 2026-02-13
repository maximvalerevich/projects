'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Loader2 } from 'lucide-react'

export default function CreateBotButton({ userId }: { userId: string }) {
    const [creating, setCreating] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleCreate = async () => {
        // Ideally use a Modal / Dialog. For MVP, using window.prompt
        const name = window.prompt("Enter Bot Name:")
        if (!name) return

        const token = window.prompt("Enter Telegram Bot Token:")
        if (!token) return

        setCreating(true)

        const { data, error } = await supabase
            .from('bots')
            .insert({
                user_id: userId,
                name,
                token
            })
            .select()
            .single()

        if (error) {
            alert('Error creating bot: ' + error.message)
        } else {
            router.push(`/editor/${data.id}`)
        }
        setCreating(false)
    }

    return (
        <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
            {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Plus className="mr-2 h-4 w-4" />
            )}
            Create Bot
        </button>
    )
}
