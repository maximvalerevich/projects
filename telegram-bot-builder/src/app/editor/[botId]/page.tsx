import { createClient } from '@/utils/supabase/server'
import FlowEditor from '@/components/editor/FlowEditor'
import { redirect } from 'next/navigation'

export default async function EditorPage({ params }: { params: Promise<{ botId: string }> }) {
    const supabase = await createClient()
    const { botId } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Verify ownership
    const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .eq('user_id', user.id)
        .single()

    if (botError || !bot) {
        return <div>Bot not found or access denied.</div>
    }

    // Fetch existing flow or create logic handled in Editor? 
    // Better to fetch here and pass as initialData
    const { data: flow } = await supabase
        .from('flows')
        .select('*')
        .eq('bot_id', botId)
        .single()

    return (
        <div className="h-screen w-full">
            <FlowEditor
                botId={botId}
                botName={bot.name}
                initialNodes={flow?.nodes || []}
                initialEdges={flow?.edges || []}
            />
        </div>
    )
}
