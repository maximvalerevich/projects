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

    // Fetch nodes (commands) and edges
    const { data: dbCommands } = await supabase
        .from('commands')
        .select('*')
        .eq('bot_id', botId)

    const { data: dbEdges } = await supabase
        .from('edges')
        .select('*')
        .eq('bot_id', botId)

    // Transform DB commands to React Flow nodes
    const initialNodes = (dbCommands || []).map((cmd) => ({
        id: cmd.id,
        type: cmd.type,
        position: cmd.coordinates || { x: 0, y: 0 },
        data: {
            label: cmd.name,
            content_blocks: cmd.content_blocks,
            keyboard: cmd.keyboard,
        },
    }))

    // Transform DB edges to React Flow edges
    const initialEdges = (dbEdges || []).map((edge) => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        sourceHandle: edge.source_handle,
    }))

    return (
        <div className="h-screen w-full">
            <FlowEditor
                botId={botId}
                botName={bot.name}
                initialNodes={initialNodes}
                initialEdges={initialEdges}
            />
        </div>
    )
}
