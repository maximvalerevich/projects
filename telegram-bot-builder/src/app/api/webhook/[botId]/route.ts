import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

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

    const supabase = createAdminClient();

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

    // @ts-ignore
    const botToken = flow.bots?.token;

    if (!botToken) {
        console.error('Bot token not found');
        return NextResponse.json({ error: 'Bot token not found' }, { status: 500 });
    }

    // 2. Fetch or create session
    let { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('bot_id', botId)
        .eq('user_id', chatId)
        .single();

    if (sessionError && sessionError.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error('Session error', sessionError);
        return NextResponse.json({ error: 'Session error' }, { status: 500 });
    }

    let currentNodeId = session?.current_node_id;

    // If no session, create one and start at the beginning
    if (!session) {
        // Find start node (node with no incoming edges)
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

        // If we just started, we might want to send the first message immediately
        // For now, let's treat the user's first message as a trigger to send the start node's message
    }

    // 3. Process current step -> Find next node

    // Simple logic: Find edge from current node
    const edge = flow.edges.find((e: any) => e.source === currentNodeId);
    const nextNodeId = edge?.target;

    if (nextNodeId) {
        // Move to next node
        const nextNode = flow.nodes.find((n: any) => n.id === nextNodeId);

        if (nextNode) {
            // Send the message defined in the next node
            await sendMessage(botToken, chatId, nextNode.data.label || 'Default message');

            // Update session
            await supabase
                .from('sessions')
                .update({ current_node_id: nextNodeId })
                .eq('bot_id', botId)
                .eq('user_id', chatId);
        }
    } else {
        // End of flow or no connection
        await sendMessage(botToken, chatId, "End of flow.");
    }

    return NextResponse.json({ ok: true });
}

async function sendMessage(token: string, chatId: string, text: string) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: text })
        });
        return await response.json();
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
    }
}
