import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

// Telegram types (simplified)
type Update = {
    update_id: number;
    message?: {
        message_id: number;
        from: {
            id: number;
            first_name: string;
            username?: string;
        };
        chat: {
            id: number;
            type: string;
        };
        text?: string;
    };
};

export async function POST(
    request: Request,
    { params }: { params: Promise<{ botId: string }> }
) {
    const { botId } = await params;
    const body: Update = await request.json();

    if (!body.message) {
        return NextResponse.json({ ok: true }); // Ignore non-message updates for now
    }

    const chatId = body.message.chat.id.toString();
    const text = body.message.text;

    // 1. Fetch flow for this bot
    const { data: flow, error: flowError } = await supabase
        .from('flows')
        .select('*, bots(token)')
        .eq('bot_id', botId)
        .single();

    if (flowError || !flow) {
        console.error('Flow not found', flowError);
        return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }

    // 2. Fetch or create session
    let { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*, bots(token)')
        .eq('bot_id', botId)
        .eq('user_id', chatId)
        .single();

    if (sessionError && sessionError.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error('Session error', sessionError);
        return NextResponse.json({ error: 'Session error' }, { status: 500 });
    }

    let currentNodeId = session?.current_node_id;

    // If no session, create one and start at the beginning (node without incoming edges usually, or a specific "start" type)
    if (!session) {
        // Find start node (e.g., node with no incoming edges or type 'start')
        // For simplicity, let's assume the first node in the array is start, or ID '1'
        // Better logic: find node with no source handle connected to it
        const targetNodeIds = new Set(flow.edges.map((e: any) => e.target));
        const startNode = flow.nodes.find((n: any) => !targetNodeIds.has(n.id));

        currentNodeId = startNode?.id || flow.nodes[0]?.id;

        const { error: insertError } = await supabase
            .from('sessions')
            .insert({ bot_id: botId, user_id: chatId, current_node_id: currentNodeId });

        if (insertError) {
            console.error('Failed to create session', insertError);
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }
    }

    // 3. Process current step
    // If we are already at a node (e.g. waiting for input), process input
    // Then move to next node

    // Simplified logic: Just find the next node connected to current node
    // In a real engine, we'd check node type (e.g. if it's an Input node, valid input?)

    // Find edge from current node
    const edge = flow.edges.find((e: any) => e.source === currentNodeId);
    const nextNodeId = edge?.target;

    if (nextNodeId) {
        // Move to next node
        const nextNode = flow.nodes.find((n: any) => n.id === nextNodeId);

        // Execute node action (send message)
        if (nextNode) {
            // @ts-ignore
            const token = flow.bots?.token;
            if (token) {
                await sendMessage(token, chatId, nextNode.data.label || 'Default message');
            }

            // Update session
            await supabase
                .from('sessions')
                .update({ current_node_id: nextNodeId })
                .eq('bot_id', botId)
                .eq('user_id', chatId);
        }
    } else {
        // End of flow or no connection
        await sendMessage(flow.bot_token, chatId, "End of flow.");
    }


    return NextResponse.json({ ok: true });
}

async function sendMessage(token: string, chatId: string, text: string) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text })
    });
    return response.json();
}
